import { motion } from 'framer-motion';

const options = [
  'تطبيق مخصص لكل عيادة (اسم + شعار + ألوان).',
  'موقع إلكتروني للعيادة متكامل مع التطبيق.',
  'نظام حجز واستشارات أونلاين.',
  'لوحة إدارة مركزية للفروع المتعددة.',
  'ربط مع بوابات الدفع المحلية.',
  'دعم فني وتحديثات مستمرة.',
];

const Options = () => {
  return (
    <section id="options" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">خيارات مرنة</span>
          <h2 className="section-title text-4xl md:text-5xl font-black mb-4">
            خيارات{' '}
            <span className="section-highlight">
              MedFlw
            </span>
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            يمكنك اختيار ما يناسب احتياجك بالضبط — وكل شيء جاهز للتفعيل خلال أيام.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {options.map((option) => (
            <motion.div
              key={option}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="feature-card !p-6 flex items-start gap-3"
            >
              <span className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-green-400 mt-1.5 flex-shrink-0" />
              <p className="theme-heading text-lg leading-relaxed">{option}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Options;


