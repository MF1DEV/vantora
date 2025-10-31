# 📧 Vantora Branded Email Setup Guide

This guide will help you set up custom branded emails for Supabase authentication (verification, password reset, etc.).

## Overview

Supabase allows you to customize email templates and use your own SMTP server for sending emails with your brand.

## Option 1: Custom Email Templates (Easiest - Uses Supabase SMTP)

This option keeps using Supabase's email service but customizes the templates with your branding.

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/hzczfmyvhjmamyiycpty
   - Go to **Authentication** → **Email Templates**

2. **Customize Templates**

   You'll see templates for:
   - **Confirm signup** - Email verification
   - **Invite user** - User invitations
   - **Magic Link** - Passwordless login
   - **Change Email Address** - Email change confirmation
   - **Reset Password** - Password reset emails

3. **Edit Each Template**

   For example, here's a branded "Confirm signup" template:

   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Verify Your Vantora Account</title>
   </head>
   <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0f172a;">
     <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 0;">
       <tr>
         <td align="center">
           <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
             
             <!-- Header with Logo/Brand -->
             <tr>
               <td style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px; text-align: center;">
                 <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                   Vantora
                 </h1>
                 <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                   Your Link in Bio Platform
                 </p>
               </td>
             </tr>
             
             <!-- Content -->
             <tr>
               <td style="padding: 40px;">
                 <h2 style="margin: 0 0 16px; color: white; font-size: 24px; font-weight: 600;">
                   Verify Your Email
                 </h2>
                 <p style="margin: 0 0 24px; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                   Thanks for signing up! Click the button below to verify your email address and get started with Vantora.
                 </p>
                 
                 <!-- Verify Button -->
                 <table cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                   <tr>
                     <td style="border-radius: 8px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);">
                       <a href="{{ .ConfirmationURL }}" 
                          style="display: inline-block; padding: 16px 32px; color: white; text-decoration: none; font-weight: 600; font-size: 16px;">
                         Verify Email Address
                       </a>
                     </td>
                   </tr>
                 </table>
                 
                 <p style="margin: 24px 0 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                   Or copy and paste this link into your browser:
                 </p>
                 <p style="margin: 8px 0 0; color: #3b82f6; font-size: 14px; word-break: break-all;">
                   {{ .ConfirmationURL }}
                 </p>
                 
                 <hr style="margin: 32px 0; border: none; border-top: 1px solid #334155;">
                 
                 <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                   If you didn't create a Vantora account, you can safely ignore this email.
                 </p>
               </td>
             </tr>
             
             <!-- Footer -->
             <tr>
               <td style="padding: 24px 40px; background-color: #0f172a; border-top: 1px solid #334155;">
                 <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
                   © 2025 Vantora. All rights reserved.
                 </p>
                 <p style="margin: 8px 0 0; color: #64748b; font-size: 12px; text-align: center;">
                   <a href="https://vantora.id" style="color: #3b82f6; text-decoration: none;">vantora.id</a>
                 </p>
               </td>
             </tr>
             
           </table>
         </td>
       </tr>
     </table>
   </body>
   </html>
   ```

4. **Available Variables**

   Each template has different variables you can use:
   
   - **Confirm signup:**
     - `{{ .ConfirmationURL }}` - Email verification link
     - `{{ .Token }}` - Verification token
     - `{{ .TokenHash }}` - Hashed token
     - `{{ .SiteURL }}` - Your site URL
   
   - **Reset Password:**
     - `{{ .ConfirmationURL }}` - Password reset link
     - `{{ .Token }}` - Reset token
     - `{{ .TokenHash }}` - Hashed token
   
   - **Magic Link:**
     - `{{ .ConfirmationURL }}` - Magic link URL
     - `{{ .Token }}` - Magic link token

5. **Test Your Templates**
   - Save the template
   - Try registering a new user to see the email
   - Check your inbox for the branded email

## Option 2: Custom SMTP Server (Full Control)

Use your own email service (SendGrid, Mailgun, AWS SES, etc.) for complete branding including sender email.

### Recommended Services:

1. **SendGrid** (Free: 100 emails/day)
   - Easy setup
   - Great deliverability
   - Free tier available

2. **Mailgun** (Free: 5,000 emails/month for 3 months)
   - Developer-friendly
   - Good for transactional emails

3. **AWS SES** (Very cheap, $0.10 per 1,000 emails)
   - Best for high volume
   - Requires AWS account

4. **Resend** (Free: 3,000 emails/month)
   - Modern, developer-friendly
   - Great for new projects

### Setup with SendGrid (Example):

#### Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for free account
3. Verify your email

#### Step 2: Verify Your Domain

1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the steps to add DNS records to your domain
4. This lets you send from `noreply@vantora.id` instead of via sendgrid

#### Step 3: Create API Key

1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it "Supabase Auth"
4. Select **Full Access** or **Restricted Access** with Mail Send permissions
5. Copy the API key (you'll only see it once!)

#### Step 4: Configure Supabase SMTP

1. Go to Supabase Dashboard → **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Enable **Enable Custom SMTP**
4. Fill in the details:

   ```
   Sender email: noreply@vantora.id
   Sender name: Vantora
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```

5. Click **Save**

#### Step 5: Test

1. Try registering a new user
2. Check that the email comes from `noreply@vantora.id`
3. Verify the branding looks correct

### Setup with Resend (Modern Alternative):

1. Go to https://resend.com/
2. Sign up for account
3. Verify your domain
4. Get API key
5. Configure in Supabase:
   ```
   Host: smtp.resend.com
   Port: 465 or 587
   Username: resend
   Password: [Your Resend API Key]
   ```

## Option 3: Programmatic Emails (Most Control)

For complete control, you can send emails programmatically using Supabase Edge Functions or Next.js API routes.

### Example: Custom Email with Resend in Next.js

1. **Install Resend:**
   ```bash
   npm install resend
   ```

2. **Create API Route:**

   Create `src/app/api/send-verification/route.ts`:

   ```typescript
   import { Resend } from 'resend';
   import { NextResponse } from 'next/server';

   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function POST(request: Request) {
     try {
       const { email, confirmationUrl } = await request.json();

       const { data, error } = await resend.emails.send({
         from: 'Vantora <noreply@vantora.id>',
         to: email,
         subject: 'Verify Your Vantora Account',
         html: `
           <!DOCTYPE html>
           <html>
           <body style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 40px;">
             <div style="max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; padding: 40px;">
               <h1 style="color: white;">Welcome to Vantora!</h1>
               <p style="color: #94a3b8; font-size: 16px;">
                 Click the button below to verify your email:
               </p>
               <a href="${confirmationUrl}" 
                  style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); 
                         color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; 
                         margin: 20px 0;">
                 Verify Email
               </a>
             </div>
           </body>
           </html>
         `,
       });

       if (error) {
         return NextResponse.json({ error }, { status: 400 });
       }

       return NextResponse.json({ data });
     } catch (error) {
       return NextResponse.json({ error }, { status: 500 });
     }
   }
   ```

3. **Use React Email for Better Templates:**
   ```bash
   npm install react-email @react-email/components
   ```

   Create `emails/VerificationEmail.tsx`:
   ```tsx
   import {
     Body,
     Button,
     Container,
     Head,
     Html,
     Preview,
     Section,
     Text,
   } from '@react-email/components';

   interface VerificationEmailProps {
     confirmationUrl: string;
   }

   export default function VerificationEmail({
     confirmationUrl,
   }: VerificationEmailProps) {
     return (
       <Html>
         <Head />
         <Preview>Verify your Vantora account</Preview>
         <Body style={main}>
           <Container style={container}>
             <Section style={header}>
               <Text style={headerText}>Vantora</Text>
             </Section>
             <Section style={content}>
               <Text style={heading}>Verify Your Email</Text>
               <Text style={paragraph}>
                 Thanks for signing up! Click the button below to verify your email.
               </Text>
               <Button style={button} href={confirmationUrl}>
                 Verify Email Address
               </Button>
             </Section>
           </Container>
         </Body>
       </Html>
     );
   }

   const main = {
     backgroundColor: '#0f172a',
     fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
   };

   const container = {
     margin: '0 auto',
     padding: '40px 20px',
     maxWidth: '600px',
   };

   const header = {
     background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
     padding: '40px',
     borderRadius: '16px 16px 0 0',
     textAlign: 'center' as const,
   };

   const headerText = {
     color: 'white',
     fontSize: '32px',
     fontWeight: '700',
     margin: '0',
   };

   const content = {
     backgroundColor: '#1e293b',
     padding: '40px',
     borderRadius: '0 0 16px 16px',
   };

   const heading = {
     color: 'white',
     fontSize: '24px',
     fontWeight: '600',
     margin: '0 0 16px',
   };

   const paragraph = {
     color: '#94a3b8',
     fontSize: '16px',
     lineHeight: '1.6',
     margin: '0 0 24px',
   };

   const button = {
     backgroundColor: '#3b82f6',
     borderRadius: '8px',
     color: 'white',
     fontSize: '16px',
     fontWeight: '600',
     textDecoration: 'none',
     textAlign: 'center' as const,
     display: 'inline-block',
     padding: '16px 32px',
   };
   ```

## Quick Recommendation

**For Vantora, I recommend:**

1. **Start with Option 1** (Custom Templates in Supabase)
   - Easiest to set up (5 minutes)
   - Free
   - Good deliverability
   - Just need to customize the HTML

2. **Later, upgrade to Option 2** (Custom SMTP with SendGrid/Resend)
   - Once you have a domain
   - Better branding (emails from @vantora.id)
   - Still very easy to set up
   - Free tier is sufficient

3. **Eventually, use Option 3** if you need:
   - Complex email logic
   - Email analytics
   - A/B testing
   - Advanced personalization

## Email Template Best Practices

1. **Keep it Mobile-Friendly**
   - Use responsive tables
   - Large buttons (min 44px height)
   - Readable font sizes (16px minimum)

2. **Brand Consistency**
   - Use your brand colors (#3b82f6, #8b5cf6)
   - Include your logo
   - Match your website's design

3. **Clear Call-to-Action**
   - One primary button
   - Clear text ("Verify Email", not "Click Here")
   - High contrast colors

4. **Accessibility**
   - Alt text for images
   - Good color contrast
   - Text fallback for everything

5. **Test Thoroughly**
   - Test on Gmail, Outlook, Apple Mail
   - Check mobile rendering
   - Verify links work
   - Test spam score (mail-tester.com)

## Environment Variables to Add

If you go with custom SMTP:

```bash
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
```

## Testing

1. **Test Email Locally:**
   - Use Mailtrap.io for development testing
   - No real emails sent, but you can see how they look

2. **Test Deliverability:**
   - Use mail-tester.com
   - Send test email and check your spam score
   - Aim for 8/10 or higher

3. **Monitor:**
   - Check SendGrid/Resend dashboard for delivery rates
   - Monitor bounce rates
   - Watch for spam complaints

## Troubleshooting

**Emails going to spam:**
- Verify your domain with DKIM/SPF
- Warm up your sending domain gradually
- Check content for spam triggers
- Use mail-tester.com to diagnose

**Emails not sending:**
- Check SMTP credentials
- Verify API key permissions
- Check Supabase logs
- Test with a different email provider

**Links not working:**
- Verify `NEXT_PUBLIC_APP_URL` is correct
- Check redirect URLs in Supabase settings
- Test in different browsers

## Next Steps

1. Choose which option you want (I recommend starting with Option 1)
2. Customize the email template with Vantora branding
3. Test with a new user registration
4. Once you have a domain, upgrade to custom SMTP
5. Monitor delivery rates and adjust as needed

Let me know which option you'd like to implement and I can help you set it up! 🚀
