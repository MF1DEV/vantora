import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import dns from 'dns'
import { promisify } from 'util'

const resolveTxt = promisify(dns.resolveTxt)
const resolveCname = promisify(dns.resolveCname)

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { domain_id } = await request.json()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get domain
    const { data: domain, error: domainError } = await supabase
      .from('custom_domains')
      .select('*')
      .eq('id', domain_id)
      .eq('user_id', user.id)
      .single()

    if (domainError || !domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
    }

    try {
      // Check TXT record for verification
      const txtRecords = await resolveTxt(`_vantora-verification.${domain.domain}`)
      const verificationRecord = txtRecords.flat().find((record) => 
        record === domain.verification_token
      )

      if (!verificationRecord) {
        return NextResponse.json(
          { error: 'TXT verification record not found. Please ensure DNS records are configured correctly.' },
          { status: 400 }
        )
      }

      // Check CNAME record
      let cnameConfigured = false
      try {
        const cnameRecords = await resolveCname(domain.domain)
        cnameConfigured = cnameRecords.some(record => 
          record.includes('vercel') || record.includes('cname')
        )
      } catch (err) {
        // CNAME might not be fully propagated yet
        console.log('CNAME check:', err)
      }

      // Update domain as verified
      const { data: updatedDomain, error: updateError } = await supabase
        .from('custom_domains')
        .update({
          verified: true,
          verified_at: new Date().toISOString(),
          dns_configured: cnameConfigured,
          ssl_status: cnameConfigured ? 'active' : 'pending',
        })
        .eq('id', domain_id)
        .select()
        .single()

      if (updateError) throw updateError

      // Also update the profile's custom_domain field
      await supabase
        .from('profiles')
        .update({ custom_domain: domain.domain })
        .eq('id', user.id)

      return NextResponse.json({ domain: updatedDomain })
    } catch (dnsError: any) {
      return NextResponse.json(
        { error: `DNS verification failed: ${dnsError.message}. Please wait a few minutes for DNS propagation and try again.` },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Verify domain error:', error)
    return NextResponse.json(
      { error: 'Failed to verify domain' },
      { status: 500 }
    )
  }
}
