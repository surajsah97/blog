import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-social-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div *ngIf="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Processing your login...</p>
      </div>
      <div *ngIf="error" class="error">
        <p>{{ errorMessage }}</p>
        <button (click)="navigateToLogin()">Back to Login</button>
      </div>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 20px;
    }
    .loading, .error {
      width: 100%;
      max-width: 450px;
      padding: 30px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #4285f4;
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error {
      color: #d93025;
    }
    button {
      margin-top: 15px;
      padding: 10px 20px;
      background-color: #4285f4;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    button:hover {
      background-color: #3367d6;
    }
  `]
})
export class SocialAuthCallbackComponent implements OnInit {
  isLoading = true;
  error = false;
  errorMessage = '';
  private isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      console.log('Not in browser environment, skipping auth processing');
      return;
    }
    
    // Get the response data from the URL
    this.route.queryParams.subscribe(params => {
      console.log('Social auth callback params:', params);
      
      if (params['token'] && params['user']) {
        try {
          // Parse the user data if it's a string
          let userData = params['user'];
          if (typeof userData === 'string') {
            userData = JSON.parse(userData);
          }
          
          // Process the authentication data
          this.authService.processAuthCallback(params['token'], userData);
          
          // Navigate to dashboard or home page
          this.router.navigate(['/dashboard']);
        } catch (error) {
          console.error('Error processing auth callback:', error);
          this.handleError('Failed to process authentication data');
        }
      } else if (params['error']) {
        this.handleError(params['error']);
      } else {
        this.handleError('Invalid authentication response');
      }
    });
  }

  handleError(message: string): void {
    this.isLoading = false;
    this.error = true;
    this.errorMessage = message;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}