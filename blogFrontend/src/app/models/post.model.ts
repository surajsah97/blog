export interface Post {
  _id: string;
  title: string;
  content: string;
  imageUrl?: string;
  tags?: string[];
  isPublished?: boolean;
  slug?: string;
  excerpt?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  author: string | any;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  viewCount: number;
  likedBy: string[];
  comments: any[];
}