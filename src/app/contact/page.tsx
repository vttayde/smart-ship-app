'use client';

import Layout from '@/components/layout/Layout';
import { CheckCircle, X, XCircle } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flashMessage, setFlashMessage] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear flash message when user starts typing
    if (flashMessage.type) {
      setFlashMessage({ type: null, message: '' });
    }
  };

  const isFormValid = () => {
    return formData.name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.message.trim() !== '' &&
      formData.email.includes('@');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFlashMessage({
        type: 'success',
        message: 'Message sent successfully! We\'ll get back to you soon.'
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Form submission error:', error);
      setFlashMessage({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissFlashMessage = () => {
    setFlashMessage({ type: null, message: '' });
  }; return (
    <Layout>
      <div className='min-h-screen bg-gray-50 py-12'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>Contact Us</h1>
            <p className='text-xl text-gray-600'>Get in touch with our shipping experts</p>
          </div>

          {/* Flash Message */}
          {flashMessage.type && (
            <div className={`mb-8 p-4 rounded-lg border-l-4 shadow-md ${flashMessage.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : 'bg-red-50 border-red-400 text-red-800'
              }`}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center'>
                  {flashMessage.type === 'success' ? (
                    <CheckCircle className='w-5 h-5 mr-3' />
                  ) : (
                    <XCircle className='w-5 h-5 mr-3' />
                  )}
                  <p className='font-medium'>{flashMessage.message}</p>
                </div>
                <button
                  onClick={dismissFlashMessage}
                  className={`ml-4 p-1 rounded-full hover:bg-opacity-20 ${flashMessage.type === 'success'
                      ? 'hover:bg-green-200'
                      : 'hover:bg-red-200'
                    }`}
                  aria-label='Dismiss message'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            </div>
          )}

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
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Name *
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${formData.name.trim() === '' ? 'border-gray-300' : 'border-green-400'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder='Enter your full name'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Email *
                  </label>
                  <input
                    type='email'
                    name='email'
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${!formData.email.includes('@') || formData.email.trim() === ''
                      ? 'border-gray-300'
                      : 'border-green-400'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder='Enter your email address'
                    required
                  />
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    name='message'
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md transition-colors ${formData.message.trim() === '' ? 'border-gray-300' : 'border-green-400'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder='Enter your message...'
                    required
                  />
                </div>
                <button
                  type='submit'
                  disabled={!isFormValid() || isSubmitting}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-all duration-200 ${isFormValid() && !isSubmitting
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>

              {/* Form validation helper text */}
              <div className='mt-4 text-xs text-gray-500'>
                <p>* All fields are required</p>
                {!isFormValid() && (
                  <p className='text-orange-600 mt-1'>
                    Please fill in all fields with valid information to enable the send button.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
