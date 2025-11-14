import { motion } from 'framer-motion';

const reasons = [
  'لأننا نمنحك تطبيقك الخاص، لا حسابًا مشتركًا.',
  'لأننا نؤمن أن كل عيادة تستحق هويتها الرقمية.',
  'لأننا نسهّل التحول الرقمي للقطاع الصحي بتقنيات بسيطة وسريعة.',
  'ولأننا في النهاية نعمل معك… لا مكانك.',
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="theme-section py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="tag-pill">لماذا MedFlw؟</span>
          <h2 className="section-title text-4xl md:text-5xl font-black mb-4">
            ماذا{' '}
            <span className="section-highlight">
              تختارنا؟
            </span>
          </h2>
          <p className="section-description text-xl max-w-3xl mx-auto">
            شركاء في رحلتك الرقمية، نعمل معك خطوة بخطوة حتى تصل إلى أفضل تجربة لمرضاك وفريقك.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="feature-card flex items-start gap-4 !p-8"
            >
              <div className="icon-circle icon-circle--info text-xl font-bold">
                {index + 1}
              </div>
              <p className="text-lg leading-relaxed theme-heading">{reason}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;


