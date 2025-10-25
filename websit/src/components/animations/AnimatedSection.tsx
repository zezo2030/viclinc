'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/lib/animations';

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedSection: React.FC<AnimatedSectionProps> = ({ 
  children, 
  className,
  delay = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={staggerContainer}
      className={className}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};
