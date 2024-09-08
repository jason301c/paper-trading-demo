/*
This route fetches stock data from the Portfolio table based on the stock ticker.
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/* Custom imports */
import { Database, TablesUpdate } from '@/lib/database.types'; // Import types

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

/*
  [GET] request: Fetch all stocks in the portfolio
*/
export async function GET() {
  try {
    const { data: portfolio, error } = await supabase
      .from('portfolio')
      .select('*');

    if (error) throw error;
    return NextResponse.json(portfolio);
  } catch (error) {
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
  const { symbol, averagePrice, totalShares } = body;

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
          .update({ totalShares: newTotalShares, averagePrice: newAveragePrice })
          .eq('symbol', symbol);

        if (updateError) throw updateError;
        return NextResponse.json(updatedStock);
      }
    } else {
      // STOCK CREATION CASE (totalShares > 0, stock does not exist)
      if (totalShares > 0) {
        const { data: newStock, error: insertError } = await supabase
          .from('portfolio')
          .insert([{ symbol, totalShares: totalShares, averagePrice: averagePrice }]);

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