// /app/api/portfolio/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET request: Fetch all stocks in the portfolio
export async function GET() {
  try {
    const portfolio = await prisma.portfolio.findMany();
    return NextResponse.json(portfolio);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching portfolio' }, { status: 500 });
  }
}

// POST request: Add a stock to the portfolio
export async function POST(req: Request) {
  const body = await req.json();

  try {
    const newStock = await prisma.portfolio.create({
      data: {
        stockTicker: body.stockTicker,
        averageBuyPrice: body.averageBuyPrice,
        shareAmount: body.shareAmount,
      },
    });
    return NextResponse.json(newStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error adding stock to portfolio' }, { status: 500 });
  }
}

// PUT request: Update a stock in the portfolio
export async function PUT(req: Request) {
  const body = await req.json();

  try {
    const updatedStock = await prisma.portfolio.update({
      where: { stockTicker: body.stockTicker },
      data: {
        averageBuyPrice: body.averageBuyPrice,
        shareAmount: body.shareAmount,
      },
    });
    return NextResponse.json(updatedStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error updating stock in portfolio' }, { status: 500 });
  }
}

// DELETE request: Remove a stock from the portfolio
export async function DELETE(req: Request) {
  const { stockTicker } = await req.json();

  try {
    const deletedStock = await prisma.portfolio.delete({
      where: { stockTicker },
    });
    return NextResponse.json(deletedStock);
  } catch (error) {
    return NextResponse.json({ error: 'Error deleting stock from portfolio' }, { status: 500 });
  }
}
