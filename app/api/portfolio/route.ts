/*
  app/api/portfolio/route.ts
  This route handles all CRUD operations for the portfolio.
*/

// Initialize Supabase client
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/Database';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

// [GET] request: Fetch all stocks in the portfolio
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

// [POST] request: Add a stock to the portfolio
export async function POST(req: Request) {
  const body = await req.json();
  const { symbol, totalShares, averagePrice } = body;

  try {
    // Check if the stock already exists in the portfolio
    const { data: existingStock, error: fetchError } = await supabase
      .from('portfolio')
      .select('*')
      .eq('symbol', symbol)
      .single(); // Fetch only one record, as we are filtering by stock symbol

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Throw an error if it's a fetch error other than "No rows found"
      throw fetchError;
    }

    if (existingStock) {
      // If the stock exists, calculate the new total shares and average price
      const newTotalShares = existingStock.totalShares + totalShares;
      const newAveragePrice =
        (existingStock.totalShares * (existingStock.averagePrice || 0) + totalShares * averagePrice) /
        newTotalShares;

      // Update the existing stock in the portfolio
      const { data: updatedStock, error: updateError } = await supabase
        .from('portfolio')
        .update({ totalShares: newTotalShares, averagePrice: newAveragePrice })
        .eq('symbol', symbol);

      if (updateError) throw updateError;

      return NextResponse.json(updatedStock);
    } else {
      // If the stock doesn't exist, insert a new stock into the portfolio
      const { data: newStock, error: insertError } = await supabase
        .from('portfolio')
        .insert([{ symbol, totalShares, averagePrice }]);

      if (insertError) throw insertError;

      return NextResponse.json(newStock);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error processing stock transaction' }, { status: 500 });
  }
}


// [PUT] request: Update a stock in the portfolio
export async function PUT(req: Request) {
  const body = await req.json();

  try {
    const { data: updatedStock, error } = await supabase
      .from('portfolio')
      .update(body)
      .eq('stockTicker', body.stockTicker);

    if (error) throw error;
    return NextResponse.json(updatedStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating stock in portfolio' }, { status: 500 });
  }
}

// [DELETE] request: Remove a stock from the portfolio
export async function DELETE(req: Request) {
  const { stockTicker } = await req.json();

  try {
    const { data: deletedStock, error } = await supabase
      .from('portfolio')
      .delete()
      .eq('stockTicker', stockTicker);

    if (error) throw error;
    return NextResponse.json(deletedStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting stock from portfolio' }, { status: 500 });
  }
}
