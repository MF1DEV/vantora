import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    return NextResponse.json({ 
      success: true, 
      message: 'Simple route works',
      body 
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'GET on login-simple works' })
}
