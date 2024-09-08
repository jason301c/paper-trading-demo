/*
  app/api/market/[ticker]/route.ts
  This route fetches stock data from the Market table based on the stock ticker.
  The market table is supposed to be a "cache" for real-life stock data, so that we don't do unecessary API calls to the stock market.
  It queries the database to find the stock with the provided ticker and returns the data.
  TODO: Implement fetching stock data from online APIs with proper caching
*/

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/* Custom imports */
import { Database } from '@/lib/database.types';

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PRIVATE_SUPABASE_SERVICE_KEY ?? '';
const supabase = createClient<Database>(supabaseUrl!, supabaseKey!);

/*
  [GET] request: Fetch stock data from the Market table based on stock ticker
*/
export async function GET(req: Request, { params }: { params: { ticker: string } }) {
  const { ticker } = params;

  try{
    const {data: stock, error} = await supabase
    .from('market')
    .select('*')
    .eq('stockTicker', ticker)
    .single();

    if (error || !stock) {
      return NextResponse.json({ error: `Stock with ticker ${ticker} not found` }, { status: 404 });
    }else{
      return NextResponse.json(stock);
    }
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching stock price' }, { status: 500 });
  }
}

