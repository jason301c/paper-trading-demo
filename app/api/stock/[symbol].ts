// /app/api/stock/[symbol].ts
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { symbol: string } }) {
  const stockPrices: { [key: string]: number } = {
    AAPL: 150,
    TSLA: 200,
    GOOGL: 2800,
  };

  const symbol = params.symbol.toUpperCase();
  if (stockPrices[symbol]) {
    return NextResponse.json({ price: stockPrices[symbol] });
  } else {
    return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  }
}
