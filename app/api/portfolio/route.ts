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

  try {
    const { data: newStock, error } = await supabase
    .from('portfolio')
    .insert([
      {
        symbol: body.symbol,
        totalShares: body.totalShares,
        averagePrice: body.averagePrice,
      },
    ]);

    if (error) throw error;
    return NextResponse.json(newStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error adding stock to portfolio' }, { status: 500 });
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
