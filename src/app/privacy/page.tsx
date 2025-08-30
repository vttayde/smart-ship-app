export default function PrivacyPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <h1 className='text-4xl font-bold text-gray-900 mb-8'>Privacy Policy</h1>

          <div className='space-y-6 text-gray-700'>
            <section>
              <h2 className='text-2xl font-semibold mb-4'>1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an
                account, make a shipment, or contact us for support.
              </p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>Account information (name, email, phone number)</li>
                <li>Shipping details (addresses, package information)</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Communication records with our support team</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>2. How We Use Your Information</h2>
              <ul className='list-disc pl-6 space-y-2'>
                <li>To provide and improve our shipping services</li>
                <li>To process payments and communicate about your shipments</li>
                <li>To send you important updates about our services</li>
                <li>To provide customer support and respond to your inquiries</li>
                <li>To analyze usage patterns and improve our platform</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>3. Information Sharing</h2>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third
                parties except as described in this policy:
              </p>
              <ul className='list-disc pl-6 mt-2 space-y-1'>
                <li>With courier partners to fulfill your shipping requests</li>
                <li>With payment processors to handle transactions</li>
                <li>When required by law or to protect our rights</li>
                <li>With your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>5. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information. You can
                also opt out of certain communications from us.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at
                privacy@smartship.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
