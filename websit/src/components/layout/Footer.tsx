import React from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from 'lucide-react';
import { CONTACT_INFO, SITE_CONFIG, FOOTER_LINKS, SOCIAL_LINKS } from '@/lib/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: SOCIAL_LINKS.facebook },
    { name: 'Twitter', icon: Twitter, href: SOCIAL_LINKS.twitter },
    { name: 'Instagram', icon: Instagram, href: SOCIAL_LINKS.instagram },
    { name: 'LinkedIn', icon: Linkedin, href: SOCIAL_LINKS.linkedin },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* معلومات الشركة */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <div className="w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-2xl">C</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              نقدم حلول طبية متطورة لتحسين جودة الرعاية الصحية 
              وتبسيط إدارة العيادات والمستشفيات.
            </p>
            
            {/* معلومات التواصل */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Phone className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">{CONTACT_INFO.phone}</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <Mail className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">{CONTACT_INFO.email}</span>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="w-5 h-5 text-primary-400" />
                <span className="text-gray-300">{CONTACT_INFO.address}</span>
              </div>
            </div>
          </div>

          {/* روابط الخدمات */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الخدمات</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* روابط الشركة */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الشركة</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* الدعم والمساعدة */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الدعم</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* الشبكات الاجتماعية */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex space-x-6 space-x-reverse mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-6 h-6" />
                </a>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              {FOOTER_LINKS.legal.map((link) => (
                <Link 
                  key={link.name}
                  href={link.href}
                  className="hover:text-primary-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © {currentYear} MedFlow. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
