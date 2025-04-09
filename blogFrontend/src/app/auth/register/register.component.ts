import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;
  returnUrl: string =  'auth/social-callback';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
    
    // Check for error message in query params (from failed social login)
    this.route.queryParams.subscribe(params => {
      if (params['error']) {
        this.errorMessage = params['error'];
      }
    });
  }
  
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }
  
  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { name, email, password } = this.registerForm.value;
      
      this.authService.register(name, email, password).subscribe({
        next: (response) => {
          this.successMessage = 'Registration successful! Redirecting to login...';
          this.errorMessage = '';
          this.isLoading = false;
          
          // Redirect to login page after a short delay
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
          this.successMessage = '';
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.registerForm);
    }
  }
  
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  registerWithGoogle() {
    this.authService.storeReturnUrl(this.returnUrl);
    this.authService.handleSocialLoginRedirect('google');
  }

  registerWithFacebook() {
    this.authService.storeReturnUrl(this.returnUrl);
    this.authService.handleSocialLoginRedirect('facebook');
  }
}