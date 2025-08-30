export default function ServicesPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900 mb-8'>Our Services</h1>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold mb-4'>Express Shipping</h3>
              <p className='text-gray-600'>
                Fast and reliable express delivery services for urgent shipments.
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold mb-4'>Bulk Shipping</h3>
              <p className='text-gray-600'>
                Cost-effective solutions for large volume shipments and cargo.
              </p>
            </div>
            <div className='bg-white p-6 rounded-lg shadow-md'>
              <h3 className='text-xl font-semibold mb-4'>International</h3>
              <p className='text-gray-600'>
                Global shipping solutions with customs clearance and tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
