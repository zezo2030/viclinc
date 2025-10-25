import { BlogPost } from '@/types';
import { mockBlogPosts } from '@/lib/mock-data';

export const blogApi = {
  getAll: async (): Promise<BlogPost[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBlogPosts;
  },
  
  getById: async (id: string): Promise<BlogPost | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBlogPosts.find(post => post.id === id) || null;
  },
  
  getBySlug: async (slug: string): Promise<BlogPost | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBlogPosts.find(post => post.slug === slug) || null;
  },
  
  getByTag: async (tag: string): Promise<BlogPost[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBlogPosts.filter(post => 
      post.tags.includes(tag)
    );
  },
  
  getByAuthor: async (author: string): Promise<BlogPost[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBlogPosts.filter(post => 
      post.author.toLowerCase().includes(author.toLowerCase())
    );
  },
  
  getRecent: async (limit: number = 5): Promise<BlogPost[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockBlogPosts
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  },
};
