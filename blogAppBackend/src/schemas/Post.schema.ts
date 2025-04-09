import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './User.schema';

// Define comment schema for better structure
export class Comment {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: mongoose.Types.ObjectId;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Post extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  imageUrl: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  author: User;

  @Prop({ default: false })
  isPublished: boolean;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: 0 })
  likes: number;

  @Prop({ type: [{ type: Object }], default: [] })
  comments: Comment[];

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
  likedBy: mongoose.Types.ObjectId[];

  @Prop()
  slug: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: Date.now })
  publishedAt: Date;

  @Prop({ default: false })
  featured: boolean;

  @Prop()
  excerpt: string;

  @Prop({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: string;
}

// Create a text index for search functionality
const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Add a pre-save hook to generate slug from title if not provided
PostSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  }
  
  // Generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 150) + '...';
  }
  
  next();
});

export { PostSchema };