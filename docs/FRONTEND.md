# Frontend Architecture Guide

## Core Components

### Application Structure
- **AppComponent**: The root component that provides the main application layout
- **HeaderComponent**: Contains the navigation bar with authentication controls
- **FooterComponent**: (Optional) Displays footer content if implemented

## Authentication Components

### Login System
- **LoginComponent**: Handles email/password authentication
- **RegisterComponent**: Manages new user registration
- **SocialAuthCallbackComponent**: Processes OAuth provider callbacks

## Blog Features

### Content Management
- **PostListComponent**: Shows a paginated list of all blog posts
- **PostDetailComponent**: Displays a single post with its comments
- **PostEditorComponent**: Provides a rich text editor for creating/editing posts

### Protected Areas
- **DashboardComponent**: Private user dashboard available after login

## Key Services

### Application Services
- **AuthService**: Manages all authentication-related operations
- **PostService**: Handles creating, reading, updating and deleting posts
- **AuthInterceptor**: Automatically adds JWT tokens to outgoing requests
- **AuthErrorInterceptor**: Catches and processes authentication errors

## Routing Configuration
```typescript
const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'posts/:id', component: PostDetailComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]  // Requires authentication
  }
];
```

## State Management Approach
- Utilizes Angular services combined with RxJS for reactive state
- JWT tokens are securely stored in localStorage
- Current user information is available through AuthService observables
