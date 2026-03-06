import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { PostsResponse } from '../../core/models/api-response.model';
import type { Post, PostFormData } from './post.models';

const API_URL = 'https://dummyjson.com/posts';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly http = inject(HttpClient);

  getAll(limit: number, skip: number) {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<PostsResponse>(API_URL, { params });
  }

  search(query: string, limit: number, skip: number) {
    const params = new HttpParams().set('q', query).set('limit', limit).set('skip', skip);
    return this.http.get<PostsResponse>(`${API_URL}/search`, { params });
  }

  getById(id: number) {
    return this.http.get<Post>(`${API_URL}/${id}`);
  }

  create(data: PostFormData) {
    return this.http.post<Post>(`${API_URL}/add`, data);
  }

  update(id: number, data: Partial<PostFormData>) {
    return this.http.put<Post>(`${API_URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<Post>(`${API_URL}/${id}`);
  }
}
