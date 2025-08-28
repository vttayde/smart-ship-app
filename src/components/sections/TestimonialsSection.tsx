import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'E-commerce Manager',
    company: 'TechCorp Solutions',
    content:
      'Ship Smart has revolutionized our logistics. We save 35% on shipping costs and our customers love the real-time tracking. Best decision we made for our business!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Rajesh Kumar',
    role: 'Small Business Owner',
    company: 'Kumar Electronics',
    content:
      "As a small business, every rupee matters. Ship Smart's rate comparison helped us find the best deals consistently. The platform is so easy to use!",
    rating: 5,
  },
  {
    id: '3',
    name: 'Anita Patel',
    role: 'Operations Head',
    company: 'Fashion Forward',
    content:
      'The reliability is outstanding. 99% of our packages reach on time, and the few times there were delays, the tracking kept our customers informed. Excellent service!',
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16'>
          <Badge className='mb-4 bg-yellow-100 text-yellow-800 hover:bg-yellow-100'>
            <Star className='w-4 h-4 mr-2' />
            Customer Stories
          </Badge>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            What Our Customers Say
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
            Join thousands of satisfied customers who trust Ship Smart for their shipping needs
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {testimonials.map(testimonial => (
            <Card
              key={testimonial.id}
              className='hover:shadow-lg transition-shadow border-0 shadow-md'
            >
              <CardContent className='p-8'>
                <div className='flex items-center mb-4'>
                  <Quote className='w-8 h-8 text-blue-600 mr-3' />
                  <div className='flex space-x-1'>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 text-yellow-400 fill-current' />
                    ))}
                  </div>
                </div>

                <p className='text-gray-700 mb-6 leading-relaxed'>"{testimonial.content}"</p>

                <div className='flex items-center'>
                  <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold mr-4'>
                    {testimonial.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <h4 className='font-semibold text-gray-900'>{testimonial.name}</h4>
                    <p className='text-sm text-gray-600'>{testimonial.role}</p>
                    <p className='text-sm text-blue-600'>{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='text-center mt-12'>
          <div className='inline-flex items-center space-x-4 bg-white rounded-full px-6 py-3 shadow-md'>
            <div className='flex space-x-1'>
              {[...Array(5)].map((_, i) => (
                <Star key={i} className='w-5 h-5 text-yellow-400 fill-current' />
              ))}
            </div>
            <span className='text-gray-700 font-medium'>4.9/5 from 10,000+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
