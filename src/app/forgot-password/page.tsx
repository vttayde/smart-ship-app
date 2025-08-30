export default function ForgotPasswordPage() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Reset your password
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        <div className='bg-white p-8 rounded-lg shadow-md'>
          <form className='space-y-6'>
            <div>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                placeholder='Enter your email'
              />
            </div>

            <div>
              <button
                type='submit'
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                Send reset link
              </button>
            </div>
          </form>

          <div className='mt-6 text-center'>
            <a href='/auth/login' className='text-sm text-blue-600 hover:text-blue-500'>
              Back to login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
