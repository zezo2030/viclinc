'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className,
  delay = 0
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial="initial"
      animate={isInView ? "animate" : "initial"}
      variants={scaleIn}
      className={className}
      transition={{ delay }}
      whileHover={{ y: -5 }}
    >
      {children}
    </motion.div>
  );
};
