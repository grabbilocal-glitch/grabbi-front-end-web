export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 dark:text-white/50">Last updated: February 2026</p>
      </div>

      <div className="rounded-2xl glass-card border border-gray-200 dark:border-white/15 p-6 md:p-8 shadow-card space-y-6 text-gray-700 dark:text-white/80 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including your name, email address, phone number, delivery addresses, and payment information. We also collect usage data such as order history, browsing activity, and device information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and deliver your orders</li>
            <li>Manage your account and loyalty points</li>
            <li>Send order updates and notifications</li>
            <li>Improve our service and user experience</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Data Sharing</h2>
          <p>
            We share your information with franchise partners solely for order fulfilment. We do not sell your personal data to third parties. We may share data with service providers who assist in operating our platform, subject to strict confidentiality agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal data. All payment information is encrypted and processed through secure payment providers. However, no method of electronic transmission is 100% secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Cookies</h2>
          <p>
            We use cookies and similar technologies to maintain your session, remember preferences, and analyse platform usage. You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. Your Rights</h2>
          <p>
            Under UK GDPR, you have the right to access, correct, delete, or export your personal data. You may also object to or restrict certain processing activities. To exercise these rights, contact us at <span className="text-brand-mint">privacy@grabbi.co.uk</span>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. Data Retention</h2>
          <p>
            We retain your personal data for as long as your account is active or as needed to provide our services. Order history is retained for a minimum of 6 years for legal and accounting purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">8. Contact</h2>
          <p>
            For privacy-related enquiries, please contact our Data Protection Officer at <span className="text-brand-mint">privacy@grabbi.co.uk</span>.
          </p>
        </section>
      </div>
    </div>
  )
}
