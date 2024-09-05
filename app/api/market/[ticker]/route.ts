// /app/api/market/[ticker]/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request, { params }: { params: { ticker: string } }) {
  const { ticker } = params; // Extract the ticker from the URL

  try {
    // Query the database for the stock ticker
    const { data: stock, error } = await supabase
      .from('market')
      .select('*')
      .eq('stockTicker', ticker.toUpperCase())
      .single(); // Ensures only one record is fetched

    // If an error occurs or no stock is found, handle the response accordingly
    if (error || !stock) {
      return NextResponse.json(
        { error: `Stock with ticker ${ticker} not found` },
        { status: 404 }
      );
    }

    // If stock is found, return the stock data
    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching stock price' },
      { status: 500 }
    );
  }
}
