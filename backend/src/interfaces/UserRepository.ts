interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface IUserRepository {
  getUserById(id: string): Promise<User | null>;
  updateUserEmail(id: string, email: string): Promise<void>;
}
