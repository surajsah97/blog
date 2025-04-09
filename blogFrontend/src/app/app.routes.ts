import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { SocialAuthCallbackComponent } from './auth/social-auth-callback/social-auth-callback.component';
import { authGuard } from './guards/auth.guard';
import { PostListComponent } from './blog/post-list/post-list.component';
import { PostDetailComponent } from './blog/post-detail/post-detail.component';
import { PostEditorComponent } from './blog/post-editor/post-editor.component';

export const routes: Routes = [
  // Public routes (no auth required)
  { path: '', redirectTo: '/blog', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  // Add the new social auth callback route
  { path: 'auth/social-callback', component: SocialAuthCallbackComponent },
  
  // Protected routes (auth required)
  { 
    path: 'blog', 
    component: PostListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'blog/new', 
    component: PostEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'blog/edit/:id', 
    component: PostEditorComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'blog/:idOrSlug', 
    component: PostDetailComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./protected/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  
  // Fallback route
  { path: '**', redirectTo: '/auth/login' }
];
