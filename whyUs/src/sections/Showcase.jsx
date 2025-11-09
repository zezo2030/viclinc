import { motion } from 'framer-motion'

const images = [
  {
    src: 'https://images.unsplash.com/photo-1631507623095-c710d184498f?auto=format&fit=crop&q=80&w=1170',
    title: 'استقبال مهيأ رقميًا',
    description: 'استقبال إلكتروني مزوّد بحجز فوري ومعلومات المرضى المتكاملة.'
  },
  {
    src: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80',
    title: 'لوحة تحكم للأطباء',
    description: 'متابعة حالة المرضى والمواعيد من أي جهاز بطريقة سلسة.'
  },
  {
    src: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1168',
    title: 'تجربة مرضى مميزة',
    description: 'رحلة علاجية متكاملة تبدأ بالحجز وتنتهي بتذكير ما بعد الزيارة.'
  },
]

const Showcase = () => {
  return (
    <section className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">
            صور حقيقية تلهمك
          </span>
          <h2 className="section-title text-4xl md:text-5xl font-black mb-4">
            منصّة متكاملة تُعيد تعريف تجربة العيادة
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            اخترنا لك لقطات تعكس كيف يساعد ميدفلو فرق عملك على إدارة كل التفاصيل بسلاسة واحترافية.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {images.map((image, index) => (
            <motion.figure
              key={image.src}
              className="showcase-card group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-[320px] object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 showcase-overlay opacity-80" />
              <figcaption className="absolute bottom-0 right-0 left-0 p-6 text-right showcase-caption">
                <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                <p className="text-sm leading-relaxed">{image.description}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Showcase
