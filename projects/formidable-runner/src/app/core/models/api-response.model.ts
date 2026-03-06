export interface PaginatedBase {
  total: number;
  skip: number;
  limit: number;
}

export interface ProductsResponse extends PaginatedBase {
  products: import('../../features/products/product.models').Product[];
}

export interface PostsResponse extends PaginatedBase {
  posts: import('../../features/posts/post.models').Post[];
}

export interface TodosResponse extends PaginatedBase {
  todos: import('../../features/todos/todo.models').Todo[];
}
