// /app/api/market/[ticker]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { ticker: string } }) {
  const { ticker } = params; // Extract the ticker from the URL
  
  try {
    // Query the database for the stock ticker
    const stock = await prisma.market.findUnique({
      where: { stockTicker: ticker.toUpperCase() }, // Make sure the ticker is uppercase
    });

    // If no stock found, return 404
    if (!stock) {
      return NextResponse.json({ error: `Stock with ticker ${ticker} not found` }, { status: 404 });
    }

    // If stock is found, return the stock data
    return NextResponse.json(stock);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return NextResponse.json({ error: 'An error occurred while fetching stock price' }, { status: 500 });
  }
}
