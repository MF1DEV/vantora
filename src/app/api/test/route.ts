import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'GET works' })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ message: 'POST works' })
}
