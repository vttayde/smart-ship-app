export default function PricingPage() {
  return (
    <div className='min-h-screen bg-gray-50 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Pricing Plans</h1>
          <p className='text-xl text-gray-600'>Choose the perfect plan for your shipping needs</p>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-2xl font-bold text-center mb-4'>Starter</h3>
            <div className='text-center mb-6'>
              <span className='text-4xl font-bold'>$29</span>
              <span className='text-gray-600'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Up to 100 shipments/month
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Basic tracking
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Email support
              </li>
            </ul>
            <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
              Get Started
            </button>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md border-2 border-blue-500'>
            <h3 className='text-2xl font-bold text-center mb-4'>Professional</h3>
            <div className='text-center mb-6'>
              <span className='text-4xl font-bold'>$79</span>
              <span className='text-gray-600'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Up to 500 shipments/month
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Advanced tracking
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Priority support
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Analytics dashboard
              </li>
            </ul>
            <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
              Most Popular
            </button>
          </div>

          <div className='bg-white p-6 rounded-lg shadow-md'>
            <h3 className='text-2xl font-bold text-center mb-4'>Enterprise</h3>
            <div className='text-center mb-6'>
              <span className='text-4xl font-bold'>$199</span>
              <span className='text-gray-600'>/month</span>
            </div>
            <ul className='space-y-3 mb-6'>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Unlimited shipments
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Real-time tracking
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                24/7 phone support
              </li>
              <li className='flex items-center'>
                <span className='text-green-500 mr-2'>✓</span>
                Custom integrations
              </li>
            </ul>
            <button className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'>
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
