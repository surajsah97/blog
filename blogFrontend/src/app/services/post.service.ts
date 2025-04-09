import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly API_URL = 'http://localhost:3001/api/posts';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.API_URL);
  }

  getPostById(id: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/${id}`);
  }

  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<Post>(`${this.API_URL}/slug/${slug}`);
  }

  createPost(postData: Partial<Post>): Observable<Post> {
    return this.http.post<Post>(this.API_URL, postData);
  }

  updatePost(id: string, postData: Partial<Post>): Observable<Post> {
    return this.http.put<Post>(`${this.API_URL}/${id}`, postData);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`);
  }

  likePost(id: string): Observable<Post> {
    return this.http.post<Post>(`${this.API_URL}/${id}/like`, {});
  }

  addComment(id: string, comment: string): Observable<Post> {
    console.log('Adding comment to post:', id, 'Comment:', comment);
    return this.http.post<Post>(`${this.API_URL}/${id}/comment`, { text: comment });
  }
}