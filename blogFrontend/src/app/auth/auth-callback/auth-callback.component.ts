import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: '<div class="loading">Processing login...</div>',
  styles: [`
    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      font-size: 18px;
      color: #555;
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('Auth callback params:', params);
      
      const token = params['token'];
      const userStr = params['user'];
      
      try {
        const userData = userStr ? JSON.parse(userStr) : null;
        
        if (token && userData) {
          this.authService.processAuthCallback(token, userData);
        } else {
          // Handle error
          this.router.navigate(['/auth/login'], { 
            queryParams: { error: 'Authentication failed' } 
          });
        }
      } catch (error) {
        console.error('Error processing auth callback:', error);
        this.router.navigate(['/auth/login'], { 
          queryParams: { error: 'Authentication failed - Invalid data format' } 
        });
      }
    });
  }
}