import { IsString, IsOptional, IsBoolean, IsArray, IsNotEmpty, IsEnum, MinLength, MaxLength, IsNumber, IsPositive, IsUrl, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean = false;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(300)
  excerpt?: string;

  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be one of: draft, published, archived' })
  @IsOptional()
  status?: string = 'draft';

  @IsBoolean()
  @IsOptional()
  featured?: boolean = false;
}

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  content?: string;

  @IsString()
  @IsOptional()
  @IsUrl({ require_tld: false }, { message: 'Image URL must be a valid URL' })
  imageUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(300)
  excerpt?: string;

  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be one of: draft, published, archived' })
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;
}

export class CommentDto {
  @IsString()
  @IsNotEmpty({ message: 'Comment text cannot be empty' })
  @MinLength(1, { message: 'Comment must be at least 1 character long' })
  @MaxLength(10000, { message: 'Comment cannot exceed 1000 characters' })
  text: string;
}

export class SearchPostDto {
  @IsString()
  @IsOptional()
  searchTerm?: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  @IsMongoId({ message: 'Author must be a valid MongoDB ID' })
  author?: string;

  @IsEnum(['draft', 'published', 'archived'], { message: 'Status must be one of: draft, published, archived' })
  @IsOptional()
  status?: string;

  @IsBoolean()
  @IsOptional()
  featured?: boolean;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  page?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  limit?: number;
}