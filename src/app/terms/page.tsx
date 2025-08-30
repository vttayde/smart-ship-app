export default function TermsPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='bg-white p-8 rounded-lg shadow-md'>
          <h1 className='text-4xl font-bold text-gray-900 mb-8'>Terms of Service</h1>

          <div className='space-y-6 text-gray-700'>
            <section>
              <h2 className='text-2xl font-semibold mb-4'>1. Acceptance of Terms</h2>
              <p>
                By accessing and using the Smart Ship platform, you accept and agree to be bound by
                the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>2. Service Description</h2>
              <p>
                Smart Ship provides an intelligent shipping platform that connects users with
                various courier services and provides advanced analytics for shipping operations.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>3. User Responsibilities</h2>
              <ul className='list-disc pl-6 space-y-2'>
                <li>Provide accurate and truthful information when creating shipments</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect the rights of other users and service providers</li>
                <li>Use the platform only for legitimate shipping purposes</li>
              </ul>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>4. Payment Terms</h2>
              <p>
                Payment for shipping services is processed through our secure payment gateway. All
                fees are clearly displayed before confirmation of any shipment.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>5. Limitation of Liability</h2>
              <p>
                Smart Ship shall not be liable for any indirect, incidental, special, consequential,
                or punitive damages, or any loss of profits or revenues.
              </p>
            </section>

            <section>
              <h2 className='text-2xl font-semibold mb-4'>6. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at
                legal@smartship.com.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
