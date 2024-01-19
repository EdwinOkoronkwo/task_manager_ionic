export interface ITask {
  id: number;
  uuid: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  task_date: Date;
  priority_level: string;
  progress_level: string;
}

export interface CRUDAction<T> {
  action: 'add' | 'update' | 'delete';
  data: T;
}
