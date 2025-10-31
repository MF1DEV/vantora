import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function GET() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'test@example.com', // Change this to your email to test
      subject: 'Test Email from Vantora',
      html: '<p>If you see this, Resend is working! ✅</p>',
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Resend error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
