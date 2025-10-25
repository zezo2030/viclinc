import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { CalendarIcon, ClockIcon, UserIcon, ArrowRightIcon } from 'lucide-react';
import { mockBlogPosts } from '@/lib/mock-data';

export const BlogList: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            المدونة الطبية
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مقالات ونصائح طبية مفيدة من فريقنا من المتخصصين
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockBlogPosts.map((post, index) => (
            <AnimatedCard 
              key={post.id} 
              delay={index * 0.1}
              className="p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 space-x-4 space-x-reverse">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 ml-1" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 ml-1" />
                    <span>{new Date(post.publishedAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 ml-1" />
                    <span>{post.readTime} دقائق</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      +{post.tags.length - 2} أكثر
                    </span>
                  )}
                </div>
                
                <Button variant="outline" className="w-full">
                  اقرأ المزيد
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            عرض جميع المقالات
          </Button>
        </div>
      </div>
    </section>
  );
};
