import { motion } from 'framer-motion';
import { useState } from 'react';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'د. أحمد العتيبي',
      role: 'مدير عيادة الرعاية الطبية',
      image: '👨‍⚕️',
      text: 'ميدفلو حوّل طريقة إدارتنا للعيادة بالكامل. النظام سهل الاستخدام والدعم الفني ممتاز. أنصح به بشدة!',
      rating: 5,
    },
    {
      name: 'د. سارة المالكي',
      role: 'طبيبة أسنان',
      image: '👩‍⚕️',
      text: 'التليميديسن والحجز الإلكتروني وفّر علينا الكثير من الوقت والجهد. مرضانا سعداء جداً بالخدمة.',
      rating: 5,
    },
    {
      name: 'م. خالد السالم',
      role: 'مدير إداري - مجمع طبي',
      image: '👔',
      text: 'التقارير والتحليلات ساعدتنا على اتخاذ قرارات أفضل. النظام يدعم عدة فروع بكفاءة عالية.',
      rating: 5,
    },
  ];

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimonials" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title text-4xl font-bold mb-4">
            ماذا يقول{' '}
            <span className="section-highlight">
              عملاؤنا؟
            </span>
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            آراء حقيقية من أطباء وإداريين يستخدمون ميدفلو يومياً
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Main Testimonial Card */}
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="testimonial-main"
          >
            {/* Quote Icon */}
            <div className="theme-accent mb-6">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>

            {/* Testimonial Text */}
            <p className="text-xl testimonial-quote mb-8">
              "{testimonials[activeIndex].text}"
            </p>

            {/* Rating */}
            <div className="flex gap-1 mb-6">
              {[...Array(testimonials[activeIndex].rating)].map((_, i) => (
                <svg key={i} className="w-6 h-6 star-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>

            {/* Author Info */}
            <div className="flex items-center gap-4">
              <div className="testimonial-avatar">
                {testimonials[activeIndex].image}
              </div>
              <div>
                <h4 className="font-bold theme-heading text-lg">
                  {testimonials[activeIndex].name}
                </h4>
                <p className="theme-text">
                  {testimonials[activeIndex].role}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="testimonial-nav"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Indicators */}
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={index === activeIndex ? 'is-active' : ''}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="testimonial-nav"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* All Testimonials (small cards) */}
          <div className="hidden lg:grid grid-cols-3 gap-6 mt-12">
            {testimonials.map((testimonial, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`testimonial-mini ${index === activeIndex ? 'is-active' : ''}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold theme-heading text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs theme-text">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-xs theme-text line-clamp-2">
                  {testimonial.text}
                </p>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

