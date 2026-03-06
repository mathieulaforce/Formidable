export interface Post {
  id: number;
  title: string;
  body: string;
  tags: string[];
  reactions: { likes: number; dislikes: number };
  views: number;
  userId: number;
  isDeleted?: boolean;
  deletedOn?: string;
}

export interface PostFormData {
  title: string;
  body: string;
  tags: string[];
  userId: number;
}
