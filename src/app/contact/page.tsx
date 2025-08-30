export default function ContactPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contact Us</h1>
          <p className='text-xl text-gray-600'>Get in touch with our shipping experts</p>
        </div>

        <div className='grid md:grid-cols-2 gap-12'>
          <div>
            <h2 className='text-2xl font-semibold mb-6'>Get In Touch</h2>
            <div className='space-y-4'>
              <div>
                <h3 className='font-medium text-gray-900'>Email</h3>
                <p className='text-gray-600'>support@smartship.com</p>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>Phone</h3>
                <p className='text-gray-600'>+1 (555) 123-4567</p>
              </div>
              <div>
                <h3 className='font-medium text-gray-900'>Address</h3>
                <p className='text-gray-600'>123 Shipping St, Logistics City, LC 12345</p>
              </div>
            </div>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-2xl font-semibold mb-6'>Send Message</h2>
            <form className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Name</label>
                <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded-md' />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type='email'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>Message</label>
                <textarea rows={4} className='w-full px-3 py-2 border border-gray-300 rounded-md' />
              </div>
              <button
                type='submit'
                className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
