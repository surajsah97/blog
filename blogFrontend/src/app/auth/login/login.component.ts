import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  returnUrl: string = '/dashboard'; // Default return URL
  showSocialLoginSuggestion: boolean = false;
  suggestedProvider: string = '';
  private isBrowser: boolean;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    // Check for error message and returnUrl in query params
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
      
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          // Handle successful login
          console.log('Login successful:', response);
          if (response && response.token) {
            // Navigate to the return URL after successful login
            this.router.navigateByUrl(this.returnUrl);
          } else if (response && response.status === 200) {
            // Alternative success format
            this.router.navigateByUrl(this.returnUrl);
          } else {
            // Unexpected response format
            console.warn('Unexpected login response format:', response);
            this.errorMessage = 'Login successful but received unexpected response format';
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          
          // Check for social provider error message
          if (error.error?.message && error.error.message.includes('registered with')) {
            this.errorMessage = error.error.message;
            
            // Extract provider name from error message
            const providerMatch = error.error.message.match(/registered with (\w+)/i);
            if (providerMatch && providerMatch[1]) {
              const provider = providerMatch[1].toLowerCase();
              
              // Show suggestion buttons based on the provider
              this.showSocialLoginSuggestion = true;
              this.suggestedProvider = provider;
            }
          } else if (error.status === 401) {
            this.errorMessage = 'Invalid email or password';
          } else if (error.status === 404) {
            this.errorMessage = 'User not found';
          } else {
            this.errorMessage = error.error?.message || 'Login failed. Please try again.';
          }
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.loginForm);
    }
  }
  
  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  loginWithGoogle() {
    if (this.isBrowser) {
      this.authService.storeReturnUrl(this.returnUrl);
      this.authService.handleSocialLoginRedirect('google');
    }
  }

  loginWithFacebook() {
    if (this.isBrowser) {
      this.authService.storeReturnUrl(this.returnUrl);
      this.authService.handleSocialLoginRedirect('facebook');
    }
  }
  
  loginWithSuggestedProvider() {
    if (this.suggestedProvider === 'google') {
      this.loginWithGoogle();
    } else if (this.suggestedProvider === 'facebook') {
      this.loginWithFacebook();
    }
  }
}
