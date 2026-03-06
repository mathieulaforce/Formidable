export interface Todo {
  id: number;
  todo: string;
  completed: boolean;
  userId: number;
  isDeleted?: boolean;
  deletedOn?: string;
}

export interface TodoFormData {
  todo: string;
  completed: boolean;
  userId: number;
}
