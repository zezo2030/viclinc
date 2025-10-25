import React from 'react';
import { Metadata } from 'next';
import { ContactForm } from '@/components/sections/ContactForm';

export const metadata: Metadata = {
  title: 'تواصل معنا | نظام إدارة العيادات',
  description: 'تواصل معنا لأي استفسارات أو طلبات. نحن هنا لمساعدتك',
  keywords: 'تواصل, استفسارات, دعم, مساعدة',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <ContactForm />
    </div>
  );
}
