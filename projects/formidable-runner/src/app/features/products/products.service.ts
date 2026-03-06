import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { ProductsResponse } from '../../core/models/api-response.model';
import type { Product, ProductCategory, ProductFormData } from './product.models';

const API_URL = 'https://dummyjson.com/products';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);

  getAll(limit: number, skip: number) {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<ProductsResponse>(API_URL, { params });
  }

  search(query: string, limit: number, skip: number) {
    const params = new HttpParams().set('q', query).set('limit', limit).set('skip', skip);
    return this.http.get<ProductsResponse>(`${API_URL}/search`, { params });
  }

  getById(id: number) {
    return this.http.get<Product>(`${API_URL}/${id}`);
  }

  getCategories() {
    return this.http.get<ProductCategory[]>(`${API_URL}/categories`);
  }

  create(data: ProductFormData) {
    return this.http.post<Product>(`${API_URL}/add`, data);
  }

  update(id: number, data: Partial<ProductFormData>) {
    return this.http.put<Product>(`${API_URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<Product>(`${API_URL}/${id}`);
  }
}
