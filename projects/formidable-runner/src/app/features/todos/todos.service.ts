import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { TodosResponse } from '../../core/models/api-response.model';
import type { Todo, TodoFormData } from './todo.models';

const API_URL = 'https://dummyjson.com/todos';

@Injectable({ providedIn: 'root' })
export class TodosService {
  private readonly http = inject(HttpClient);

  getAll(limit: number, skip: number) {
    const params = new HttpParams().set('limit', limit).set('skip', skip);
    return this.http.get<TodosResponse>(API_URL, { params });
  }

  getById(id: number) {
    return this.http.get<Todo>(`${API_URL}/${id}`);
  }

  create(data: TodoFormData) {
    return this.http.post<Todo>(`${API_URL}/add`, data);
  }

  update(id: number, data: Partial<TodoFormData>) {
    return this.http.put<Todo>(`${API_URL}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete<Todo>(`${API_URL}/${id}`);
  }
}
