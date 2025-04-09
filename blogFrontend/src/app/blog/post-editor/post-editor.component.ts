import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PostService } from '../../services/post.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.css'
})
export class PostEditorComponent implements OnInit {
  postForm: FormGroup;
  isEditing = false;
  postId: string | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: ['', Validators.pattern('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')],
      tags: [''],
      excerpt: ['', [Validators.maxLength(300)]],
      status: ['draft'],
      featured: [false]
    });
  }

  ngOnInit(): void {
    // Check if user is authenticated
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/auth/login']);
      }
    });

    // Check if editing existing post
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditing = true;
        this.postId = id;
        this.loadPost(id);
      }
    });
  }

  loadPost(id: string): void {
    this.isLoading = true;
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        // Convert tags array to comma-separated string
        const tagsString = post.tags ? post.tags.join(', ') : '';
        
        this.postForm.patchValue({
          title: post.title,
          content: post.content,
          imageUrl: post.imageUrl || '',
          tags: tagsString,
          excerpt: post.excerpt || '',
          status: post.status || 'draft',
          featured: post.featured || false
        });
        
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load post. Please try again.';
        this.isLoading = false;
        console.error('Error loading post:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      this.markFormGroupTouched(this.postForm);
      return;
    }

    this.isLoading = true;
    
    // Convert comma-separated tags to array
    const formValue = { ...this.postForm.value };
    if (formValue.tags) {
      formValue.tags = formValue.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);
    }

    if (this.isEditing && this.postId) {
      this.updatePost(formValue);
    } else {
      this.createPost(formValue);
    }
  }

  createPost(postData: any): void {
    this.postService.createPost(postData).subscribe({
      next: (post) => {
        this.successMessage = 'Post created successfully!';
        this.isLoading = false;
        
        // Navigate to the new post after a short delay
        setTimeout(() => {
          this.router.navigate(['/blog', post.slug || post._id]);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to create post. Please try again.';
        this.isLoading = false;
        console.error('Error creating post:', err);
      }
    });
  }

  updatePost(postData: any): void {
    if (!this.postId) return;
    
    this.postService.updatePost(this.postId, postData).subscribe({
      next: (post) => {
        this.successMessage = 'Post updated successfully!';
        this.isLoading = false;
        
        // Navigate to the updated post after a short delay
        setTimeout(() => {
          this.router.navigate(['/blog', post.slug || post._id]);
        }, 1500);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to update post. Please try again.';
        this.isLoading = false;
        console.error('Error updating post:', err);
      }
    });
  }

  // Helper to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}