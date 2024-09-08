/*
  app/api/market/[ticker]/route.ts
  This route fetches stock data from the Market table based on the stock ticker.
  The market table is supposed to be a "cache" for real-life stock data, so that we don't do unecessary API calls to the stock market.
  It queries the database to find the stock with the provided ticker and returns the data.
  TODO: Implement proper caching and overwriting
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// Initialize finnhub
const finnhub = require('finnhub');
const api_key = finnhub.ApiClient.instance.authentications['api_key'];
api_key.apiKey = process.env.FINNHUB_API_KEY;
const finnhubClient = new finnhub.DefaultApi();

// Helper function to fetch stock price from Finnhub
async function fetchStockFromFinnhub(ticker: string): Promise<any> {
  return new Promise((resolve, reject) => {
    finnhubClient.quote(ticker, (error: any, data: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

export async function GET(req: Request, { params }: { params: { ticker: string } }) {
  const { ticker } = params;

  try {
    // Step 1: Try to fetch the stock from the Supabase database
    const { data: stock, error } = await supabase
      .from('market')
      .select('*')
      .eq('stockTicker', ticker)
      .single();

    if (error || !stock) {
      // Step 2: If no stock found in Supabase, fetch from Finnhub
      try {
        const stockData = await fetchStockFromFinnhub(ticker);

        if (stockData) {
          // Extract the required fields from Finnhub data (e.g., `c` for current price)
          const stockPrice = stockData.c;
          const timeOfUpdate = new Date().toISOString(); // Current timestamp

          // Step 3: Insert the stock data into Supabase for caching
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

          // Return the fetched data
          return NextResponse.json({ stockTicker: ticker, stockPrice, timeOfUpdate });
        } else {
          return NextResponse.json({ error: 'Stock data not available from Finnhub' }, { status: 404 });
        }
      } catch (finnhubError) {
        console.error('Error fetching stock from Finnhub:', finnhubError);
        return NextResponse.json(
          { error: 'An error occurred while fetching stock price from Finnhub' },
          { status: 500 }
        );
      }
    } else {
      // Step 4: If stock found in Supabase, return it
      return NextResponse.json(stock);
    }
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching stock price' }, { status: 500 });
  }
}
