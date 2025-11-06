'use client';

import type { Metadata } from 'next';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  SearchIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  ArrowRightIcon,
  ShareIcon,
  BookmarkIcon,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  publishedDate: string;
  readTime: number;
  tags: string[];
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'نصائح للعناية بالصحة النفسية',
    excerpt: 'تعرف على الطرق الفعالة للحفاظ على صحتك النفسية والعقلية',
    content: 'محتوى المقال الكامل...',
    image: '/blog-1.jpg',
    author: { name: 'د. أحمد محمد', avatar: '/avatar-1.jpg' },
    category: 'الصحة النفسية',
    publishedDate: '2024-01-15',
    readTime: 5,
    tags: ['صحة نفسية', 'العافية', 'نصائح'],
    featured: true,
  },
  {
    id: '2',
    title: 'التغذية السليمة في رمضان',
    excerpt: 'نصائح غذائية هامة لصحتك خلال شهر رمضان الكريم',
    content: 'محتوى المقال الكامل...',
    image: '/blog-2.jpg',
    author: { name: 'أ. فاطمة علي', avatar: '/avatar-2.jpg' },
    category: 'التغذية',
    publishedDate: '2024-01-10',
    readTime: 7,
    tags: ['تغذية', 'رمضان', 'صحة'],
    featured: true,
  },
  {
    id: '3',
    title: 'الرياضة اليومية وفوائدها',
    excerpt: 'كيفية دمج الرياضة في روتينك اليومي للحصول على حياة صحية',
    content: 'محتوى المقال الكامل...',
    image: '/blog-3.jpg',
    author: { name: 'د. محمود حسن', avatar: '/avatar-3.jpg' },
    category: 'اللياقة البدنية',
    publishedDate: '2024-01-05',
    readTime: 6,
    tags: ['رياضة', 'لياقة بدنية', 'صحة'],
    featured: false,
  },
  {
    id: '4',
    title: 'أعراض الإجهاد وكيفية التعامل معها',
    excerpt: 'تعرف على علامات الإجهاد وطرق فعالة للتعامل معها',
    content: 'محتوى المقال الكامل...',
    image: '/blog-4.jpg',
    author: { name: 'د. سارة محمود', avatar: '/avatar-4.jpg' },
    category: 'الصحة النفسية',
    publishedDate: '2023-12-28',
    readTime: 8,
    tags: ['إجهاد', 'صحة نفسية', 'نصائح'],
    featured: false,
  },
];

const categories = ['الكل', 'الصحة النفسية', 'التغذية', 'اللياقة البدنية', 'طب عام'];

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const featuredPost = blogPosts.find((post) => post.featured);
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch = post.title.includes(searchQuery) || post.excerpt.includes(searchQuery);
    const matchesCategory = selectedCategory === 'الكل' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="gradient-medical-light border-b border-primary-100 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-gradient-medical">مدونة</span> الصحة والعافية
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نصائح وخبرات طبية موثوقة لحياة أكثر صحة وسعادة
          </p>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <Card className="overflow-hidden border-2 border-primary-100 hover:shadow-xl transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative h-64 md:h-auto">
                  <div className="absolute inset-0 bg-primary-600 opacity-20"></div>
                  <div className="w-full h-full bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center">
                    <span className="text-6xl">📰</span>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 mb-4 w-fit">
                    <div className="w-6 h-6 rounded-full gradient-medical flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⭐</span>
                    </div>
                    <span className="text-sm font-semibold text-primary-600">مقال مميز</span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{featuredPost.title}</h2>
                  <p className="text-gray-600 mb-4">{featuredPost.excerpt}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(featuredPost.publishedDate).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        {featuredPost.readTime} دقائق قراءة
                      </div>
                    </div>
                    <Link href={`/blog/${featuredPost.id}`}>
                      <Button className="gradient-medical text-white hover:opacity-90">
                        اقرأ المزيد
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-12 space-y-6"
        >
          {/* Search */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مقالات..."
              className="pl-12 py-3 border-2 border-gray-300 focus:border-primary-500"
            />
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  selectedCategory === category
                    ? 'gradient-medical text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2 border-gray-100 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden">
                {/* Image */}
                <div className="relative h-40 bg-gradient-to-br from-primary-300 to-secondary-300 flex items-center justify-center overflow-hidden">
                  <span className="text-4xl group-hover:scale-110 transition-transform">📄</span>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col h-full">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 flex-grow">{post.excerpt}</p>

                  {/* Author and Meta */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-4 h-4" />
                        {new Date(post.publishedDate).toLocaleDateString('ar-SA')}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        {post.readTime} دقائق
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{post.author.name}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/blog/${post.id}`} className="flex-1">
                      <Button className="w-full gradient-medical text-white hover:opacity-90 text-sm">
                        اقرأ
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary-500 text-primary-600 hover:bg-primary-50"
                    >
                      <BookmarkIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-600 hover:bg-gray-100"
                    >
                      <ShareIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-gray-600">لم نجد مقالات تطابق بحثك</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('الكل');
              }}
              className="mt-4 border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
            >
              إعادة تعيين
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
