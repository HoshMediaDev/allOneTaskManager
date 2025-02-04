export interface Comment {
  id: string;
  taskId: string;
  content: string;
  createdAt: string;
  userId: string;
  userName: string; // For now, until we add authentication
}