import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userPosts: Post[] = [];
  isLoading = true;
  error: string | null = null;
  currentUser: any = null;
  
  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadUserPosts();
  }
  
  loadUserPosts(): void {
    this.isLoading = true;
    this.error = null;
    this.currentUser = this.authService.getCurrentUser();
  
    if (!this.currentUser?._id) {
      this.error = 'User session expired. Please login again.';
      this.isLoading = false;
      return;
    }
  
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        if (!Array.isArray(posts)) {
          console.error('Expected posts array, got:', posts);
          this.error = 'Invalid data format received';
          this.isLoading = false;
          return;
        }
  
        this.userPosts = posts.filter(post => {
          const postAuthorId = post.author?._id || post.author;
          const userId = this.currentUser._id;
          const isMatch = postAuthorId === userId;
          console.log(`Comparing post author ${postAuthorId} with user ${userId}: ${isMatch}`);
          return isMatch;
        });
  
        console.log('Filtered posts:', this.userPosts);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading posts:', err);
        this.error = 'Failed to load your posts. Please try again later.';
        this.isLoading = false;
      }
    });
  }
  
  deletePost(id: string): void {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.userPosts = this.userPosts.filter(post => post._id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete post. Please try again.';
          console.error('Error deleting post:', err);
        }
      });
    }
  }
}