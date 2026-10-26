export interface ITodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  userId?: number;
  tagIds?: number[];
}

export type TodoFilter = 'all' | 'active' | 'completed';

export interface CreateTodoInput {
  title: string;
  userId?: number;
}

export interface UpdateTodoInput {
  title?: string;
  completed?: boolean;
}
