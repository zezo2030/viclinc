import { motion } from 'framer-motion';

const SocialProof = () => {
  const trustBadges = [
    { text: 'آمن ومعتمد', icon: '🔒' },
    { text: 'دعم فني 24/7', icon: '💬' },
    { text: 'تحديثات دورية', icon: '🔄' },
    { text: 'بيانات محمية', icon: '🛡️' },
  ];

  return (
    <section className="theme-section py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <p className="section-description text-sm mb-6">موثوق به من قبل مئات العيادات في المملكة</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="trust-badge"
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="text-sm font-semibold">{badge.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

