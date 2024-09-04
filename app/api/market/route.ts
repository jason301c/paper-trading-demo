// /app/api/market/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET request: Fetch cached stock prices
export async function GET() {
  try {
    const marketData = await prisma.market.findMany();
    return NextResponse.json(marketData);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching market data' }, { status: 500 });
  }
}

// POST request: Add stock price to cache
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newMarketData = await prisma.market.create({
      data: {
        stockTicker: body.stockTicker,
        stockPrice: body.stockPrice,
        timeOfUpdate: new Date(),
      },
    });
    return NextResponse.json(newMarketData);
  } catch (error) {
    return NextResponse.json({ error: 'Error adding stock price to cache' }, { status: 500 });
  }
}

// PUT request: Update stock price in cache
export async function PUT(req: Request) {
  const body = await req.json();

  try {
    const updatedMarketData = await prisma.market.update({
      where: { stockTicker: body.stockTicker },
      data: {
        stockPrice: body.stockPrice,
        timeOfUpdate: new Date(),
      },
    });
    return NextResponse.json(updatedMarketData);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating stock price in cache' }, { status: 500 });
  }
}
