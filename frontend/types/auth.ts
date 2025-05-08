export interface User {
    id: string;
    email: string;
    username: string;
  }
  
export interface AuthResponse {
    status: 'success' | 'failed';
    message?: string;
    data?: {
      token: string;
      user: User;
    };
}