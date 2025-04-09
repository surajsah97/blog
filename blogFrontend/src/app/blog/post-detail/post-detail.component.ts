import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  isLoading = true;
  error: string | null = null;
  newComment = '';
  isAuthenticated = false;
  currentUser: any = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.currentUser = this.authService.getCurrentUser();
      }
    });

    this.route.paramMap.subscribe(params => {
      const idOrSlug = params.get('idOrSlug');
      if (idOrSlug) {
        this.loadPost(idOrSlug);
      }
    });
  }

  loadPost(idOrSlug: string): void {
    this.isLoading = true;
    
    // Try to load by slug first
    this.postService.getPostBySlug(idOrSlug).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
      },
      error: (err) => {
        // If not found by slug, try by ID
        if (err.status === 404) {
          this.postService.getPostById(idOrSlug).subscribe({
            next: (post) => {
              this.post = post;
              this.isLoading = false;
            },
            error: (err) => {
              this.handleError(err);
            }
          });
        } else {
          this.handleError(err);
        }
      }
    });
  }

  handleError(err: any): void {
    this.error = 'Failed to load post. Please try again later.';
    this.isLoading = false;
    console.error('Error loading post:', err);
  }

  likePost(): void {
    if (!this.post || !this.isAuthenticated) return;
    
    this.postService.likePost(this.post._id).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
      },
      error: (err) => {
        console.error('Error liking post:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.post || !this.isAuthenticated || !this.newComment.trim()) return;
    
    this.postService.addComment(this.post._id, this.newComment).subscribe({
      next: (updatedPost) => {
        this.post = updatedPost;
        this.newComment = '';
      },
      error: (err) => {
        console.error('Error adding comment:', err);
      }
    });
  }
}