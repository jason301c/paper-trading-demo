/*
  app/api/market/[ticker]/route.ts
  This route fetches stock data from the Market table based on the stock ticker.
  The market table is supposed to be a "cache" for real-life stock data, so that we don't do unecessary API calls to the stock market.
  It queries the database to find the stock with the provided ticker and returns the data.
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database, Tables } from '@/lib/database.types';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// Initialize Finnhub
const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY;
const finnhubClient = new finnhub.DefaultApi();

// Adjustable cache time (ms)
const CACHE_EXPIRATION_MINUTES = 15 * 60 * 1000;

// Helper function to fetch stock price from Finnhub
async function fetchStockFromFinnhub(ticker: string): Promise<any> {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(ticker, (error: any, data: any) => {
      if (error) {
        if (error.status === 429) {
          // Handle rate limiting
          reject({ status: 429, message: 'Rate limit exceeded' });
        } else {
          reject(error);
        }
      } else {
        resolve(data);
      }
    });
  });
}

// Helper function to check if cache is still valid
function isCacheValid(lastUpdate: string): boolean {
  if (lastUpdate == ''){
    return false;
  }
  const lastUpdateTime = new Date(lastUpdate).getTime();
  const currentTime = new Date().getTime();
  return currentTime - lastUpdateTime < CACHE_EXPIRATION_MINUTES;
}


/*
[GET] /api/market/[ticker]
This route fetches stock data from the Market table based on the stock ticker.
The market table is supposed to be a "cache" for real-life stock data, so that we don't do unecessary API calls to the stock market.
*/
export async function GET(req: Request, { params }: { params: { ticker: string } }) {
  const { ticker } = params;

  try {
    // Step 1: Try to fetch the stock from the Supabase database
    const { data: stock, error } = await supabase
      .from('market')
      .select('*')
      .eq('stockTicker', ticker)
      .single();

    // Step 2: If stock exists and cache is still valid, return it
    if (stock && !error && isCacheValid(stock.timeOfUpdate ?? '')) {
      return NextResponse.json(stock);
    }

    // Step 3: Fetch the stock from Finnhub if cache is invalid or not found
    try {
      const stockData = await fetchStockFromFinnhub(ticker);

      if (stockData) {
        const stockPrice = stockData.c;
        const timeOfUpdate = new Date().toISOString(); // Current timestamp

        if (stock) {
          // Step 4: Update the stock data if it exists in the cache but is outdated
          const { error: updateError } = await supabase
            .from('market')
            .update({ stockPrice, timeOfUpdate })
            .eq('stockTicker', ticker);

          if (updateError) {
            // Delete the cache if it can't be updated
            const { error: deleteError } = await supabase
              .from('market')
              .delete()
              .eq('stockTicker', ticker);

              if (deleteError) {
                console.error('Error deleting stock from Supabase:', deleteError);
                return NextResponse.json(
                  { error: 'An error occurred while updating cached stock data' },
                  { status: 500 }
                );
              }
          }
        } else {
          // Step 5: Insert the stock data into Supabase if it doesn’t exist
          const { error: insertError } = await supabase
            .from('market')
            .insert([{ stockTicker: ticker, stockPrice, timeOfUpdate }]);

          if (insertError) {
            console.error('Error inserting stock into Supabase:', insertError);
            return NextResponse.json(
              { error: 'An error occurred while caching stock data' },
              { status: 500 }
            );
          }
        }

        // Return the fetched data
        return NextResponse.json({ stockTicker: ticker, stockPrice, timeOfUpdate });
      } else {
        return NextResponse.json({ error: 'Stock data not available from Finnhub' }, { status: 404 });
      }
    } catch (finnhubError: any) {
      if (finnhubError.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded, please try again later' },
          { status: 429 }
        );
      }
      console.error('Error fetching stock from Finnhub:', finnhubError);
      return NextResponse.json(
        { error: 'An error occurred while fetching stock price from Finnhub' },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching stock price' }, { status: 500 });
  }
}
