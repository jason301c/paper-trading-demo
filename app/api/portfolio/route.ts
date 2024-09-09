/*
app/api/portfolio/route.ts
This route fetches stock data from the Portfolio table based on the stock ticker.
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Tables, TablesUpdate } from '@/lib/database.types';
import axios from 'axios';

/* Custom imports */
import { Database } from '@/lib/database.types'; // Import types

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// Constants
const TIME_TO_UPDATE = 30 * 60 * 1000; // 30 minutes in milliseconds

// Variable to track when the portfolio was last updated
let lastPortfolioUpdate: string | null = null;

// Helper function to check if it's time to update the portfolio
function isTimeToUpdatePortfolio(): boolean {
  if (!lastPortfolioUpdate) {
    return true; // If last update is null, it's time to update
  }

  const lastUpdateTime = new Date(lastPortfolioUpdate).getTime();
  const currentTime = new Date().getTime();
  return currentTime - lastUpdateTime > TIME_TO_UPDATE;
}

// Helper function to update portfolio stock prices using the market route
async function updatePortfolioStocks(portfolio: Tables<'portfolio'>[]) {
  await Promise.all(
    portfolio.map(async (stock) => {
      try {
        const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/market/${stock.symbol}`);
        const stockData = await response.json() as Tables<'market'>;
        if (response.ok) {
          const { error: updateError } = await supabase
            .from('portfolio')
            .update({ lastKnownPrice: stockData.stockPrice })
            .eq('symbol', stock.symbol);
          
          portfolio.forEach(stock => {
            stock.lastKnownPrice = stockData.stockPrice;
          });

          if (updateError) {
            throw new Error(`Error updating stock ${stock.symbol}`);
          }
        }
      } catch (error) {
        console.error(`Error fetching stock data for ${stock.symbol}: `, error);
      }
    })
  );

  // Set the last portfolio update time
  lastPortfolioUpdate = new Date().toISOString();
  return portfolio;
}

// [GET] request: Fetch all stocks in the portfolio
export async function GET() {
  try {
    // Step 1: Fetch the portfolio
    const { data: portfolio, error } = await supabase
      .from('portfolio')
      .select('*');

    if (error) throw error;

    if (!portfolio || portfolio.length === 0) {
      return NextResponse.json({ error: 'No portfolio data found' }, { status: 404 });
    }


    // Step 2: Check if it's time to update the portfolio
    if (isTimeToUpdatePortfolio()) {
      const newPortfolio = await updatePortfolioStocks(portfolio); // Update the portfolio with new stock prices
      return NextResponse.json(newPortfolio);
    }else{
      return NextResponse.json(portfolio);
    }

  } catch (error) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ error: 'Error fetching portfolio' }, { status: 500 });
  }
}

/*
  [PATCH] request: Increment or decrement totalShares in the portfolio
  This endpoint allows you to increment or decrement shares.

  Example body:
  {
    "symbol": "AAPL",
    "totalShares": 5,
    "averagePrice": 150
  }
  This would mean that you increase the total shares of AAPL by 5 at an price of $150.
*/
export async function PATCH(req: Request) {
  const body = await req.json() as TablesUpdate<'portfolio'>;
  const { symbol, averagePrice, totalShares, lastKnownPrice } = body;

  try {
    // Ensure the required fields are present
    if (!symbol || !averagePrice || !totalShares) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the existing stock in the portfolio
    const { data: existingStock, error: fetchError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('symbol', symbol)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // If stock exists:
    if (existingStock) {
      const newTotalShares = existingStock.totalShares + totalShares;

      // Error if the new total share amount is negative
      if (newTotalShares < 0) {
        return NextResponse.json({ error: 'Cannot have negative shares' }, { status: 400 });
      }

      if (newTotalShares === 0) {
        // STOCK DELETION CASE (totalShares === 0)
        const { data: deletedStock, error: deleteError } = await supabase
          .from('portfolio')
          .delete()
          .eq('symbol', symbol);

        if (deleteError) throw deleteError;
        return NextResponse.json(deletedStock);
      } else {
        // STOCK UPDATE CASE (totalShares > 0)
        const newAveragePrice =
          (existingStock.totalShares * (existingStock.averagePrice) + totalShares * averagePrice) /
          (newTotalShares || 1); // Avoid division by zero

        const { data: updatedStock, error: updateError } = await supabase
          .from('portfolio')
          .update({ totalShares: newTotalShares, averagePrice: newAveragePrice, lastKnownPrice: averagePrice })
          .eq('symbol', symbol);

        if (updateError) throw updateError;
        return NextResponse.json(updatedStock);
      }
    } else {
      // STOCK CREATION CASE (totalShares > 0, stock does not exist)
      if (totalShares > 0) {
        const { data: newStock, error: insertError } = await supabase
          .from('portfolio')
          .insert([{ symbol, totalShares: totalShares, averagePrice: averagePrice, lastKnownPrice: averagePrice }]);

        if (insertError) throw insertError;
        return NextResponse.json(newStock);
      } else {
        return NextResponse.json({ error: 'Stock does not exist to decrement' }, { status: 400 });
      }
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error processing stock transaction' }, { status: 500 });
  }
}
