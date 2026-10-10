import type { IUserRepository } from "../interfaces/UserRepository.js";

export class UserRepositorySQL implements IUserRepository {
  async getUserById(id: string): ReturnType<IUserRepository["getUserById"]> {
    // return database.query(`SELECT * FROM users WHERE id = ?`, [id]);
    // No SQL lookup is implemented yet, so there is no user to return.
    return null;
  }
  async updateUserEmail(id: string, email: string) {
    return;
    // return database.query(`UPDATE users SET email = ? WHERE id = ?`, [
    //   email,
    //   id,
    // ]);
  }
}
