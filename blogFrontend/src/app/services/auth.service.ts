import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3001/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Initialize authentication state from localStorage on service creation
    if (this.isBrowser) {
      const hasToken = this.hasToken();
      this.isAuthenticatedSubject.next(hasToken);
      console.log('Auth service initialized, authenticated:', hasToken);
    }
  }
  
  login(email: string, password: string): Observable<any> {
    console.log('Login request:', { email, password },`${this.API_URL}/login`);
    return this.http.post(`${this.API_URL}/login`, { email, password })
      .pipe(
        tap((response: any) => {
          if (response.token && this.isBrowser) {
            console.log('Token received:', response.token);
            localStorage.setItem('auth_token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }
  
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
    }
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/auth/login']);
  }
  
  getToken(): string | null {
    return this.isBrowser ? localStorage.getItem('auth_token') : null;
  }
  
  getCurrentUser(): any {
    if (!this.isBrowser) return null;
    
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      const user = JSON.parse(userStr);
      // Ensure we have the user ID
      if (!user._id && user.id) {
        user._id = user.id; // Some APIs return id instead of _id
      }
      return user;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }
  
  private hasToken(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    try {
      return !!localStorage.getItem('auth_token');
    } catch (error) {
      console.warn('Error accessing localStorage:', error);
      return false;
    }
  }
  
  // Handle social login redirects
  handleSocialLoginRedirect(provider: 'google' | 'facebook'): void {
    if (this.isBrowser) {
      window.location.href = `${this.API_URL}/${provider}`;
    }
  }
  
  // Process token from URL after social login redirect
  processAuthCallback(token: string, userData: any): void {
    if (token && this.isBrowser) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      this.isAuthenticatedSubject.next(true);
      
      // Check if there's a returnUrl in localStorage
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl'); // Clean up
      
      this.router.navigateByUrl(returnUrl);
    }
  }
  
  // Add a method to store returnUrl before social login
  storeReturnUrl(url: string): void {
    if (this.isBrowser) {
      localStorage.setItem('returnUrl', url);
    }
  }
  
  // Add this method to your existing AuthService class
  
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, {
      name,
      email,
      password,
      "provider": "local"
    });
  }
}