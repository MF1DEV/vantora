import Link from 'next/link'
import { Shield, Lock, Eye, Database, UserX, Download, Cookie } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-lg">
            Last updated: October 31, 2025
          </p>
        </div>

        {/* Content */}
        <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-3 text-purple-400" />
              Your Privacy Matters
            </h2>
            <p className="text-slate-300 leading-relaxed">
              At Vantora, we take your privacy seriously. This policy explains how we collect, use, 
              and protect your personal information when you use our service.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Database className="w-6 h-6 mr-3 text-blue-400" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Account Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Email address (for account creation and authentication)</li>
                  <li>Username and display name</li>
                  <li>Profile picture (optional)</li>
                  <li>Bio and custom links</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Profile views and link clicks (analytics)</li>
                  <li>IP address and user agent</li>
                  <li>Device and browser information</li>
                  <li>Login and activity timestamps</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Eye className="w-6 h-6 mr-3 text-green-400" />
              How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide analytics about your profile performance</li>
              <li>To detect and prevent security threats and fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Lock className="w-6 h-6 mr-3 text-red-400" />
              Data Security
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>All data transmitted over HTTPS with TLS encryption</li>
              <li>Passwords hashed using bcrypt</li>
              <li>Optional two-factor authentication (2FA)</li>
              <li>Rate limiting to prevent brute force attacks</li>
              <li>Regular security audits and updates</li>
              <li>Secure session management</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Cookie className="w-6 h-6 mr-3 text-amber-400" />
              Cookies and Tracking
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              We use essential cookies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>Keep you logged in to your account</li>
              <li>Remember your preferences</li>
              <li>Provide security features</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              We do NOT use:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li>Third-party advertising cookies</li>
              <li>Tracking cookies for marketing purposes</li>
              <li>Social media tracking pixels</li>
            </ul>
          </section>

          {/* Your Rights (GDPR) */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <Download className="w-6 h-6 mr-3 text-cyan-400" />
              Your Data Rights (GDPR)
            </h2>
            <p className="text-slate-300 leading-relaxed mb-4">
              Under GDPR and similar regulations, you have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Portability:</strong> Export your data in JSON format</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
              <li><strong>Objection:</strong> Object to certain data processing</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              You can exercise these rights from your <Link href="/settings" className="text-purple-400 hover:text-purple-300 underline">account settings</Link> page, 
              including downloading all your data or permanently deleting your account.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
              <UserX className="w-6 h-6 mr-3 text-orange-400" />
              Data Retention and Deletion
            </h2>
            <p className="text-slate-300 leading-relaxed">
              We retain your personal information only for as long as necessary to provide our services. 
              When you delete your account, we permanently remove all your data including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4 mt-4">
              <li>Profile information</li>
              <li>All links and content</li>
              <li>Analytics data</li>
              <li>Uploaded files</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              Some data may be retained for a limited time for legal or security purposes (e.g., audit logs).
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services</h2>
            <p className="text-slate-300 leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-4 mt-4">
              <li><strong>Supabase:</strong> Database and authentication (data hosted in secure data centers)</li>
              <li><strong>Vercel:</strong> Hosting and CDN</li>
            </ul>
            <p className="text-slate-300 leading-relaxed mt-4">
              These services have their own privacy policies and security measures in place.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Children's Privacy</h2>
            <p className="text-slate-300 leading-relaxed">
              Vantora is not intended for users under the age of 13. We do not knowingly collect 
              personal information from children. If you believe we have collected information from 
              a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Changes to This Policy</h2>
            <p className="text-slate-300 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of significant 
              changes by email or through a notice on our website. Your continued use of Vantora after 
              changes are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-slate-300 leading-relaxed">
              If you have questions about this privacy policy or how we handle your data, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-slate-300">
              <p><strong>Email:</strong> privacy@vantora.id</p>
              <p><strong>Support:</strong> support@vantora.id</p>
            </div>
          </section>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
