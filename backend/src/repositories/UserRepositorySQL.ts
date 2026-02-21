import type { IUserRepository } from "../interfaces/UserRepository.ts";

export class UserRepositorySQL implements IUserRepository {
  async getUserById(id: string) {
    // return database.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return {
      id,
    };
  }
  async updateUserEmail(id: string, email: string) {
    return;
    // return database.query(`UPDATE users SET email = ? WHERE id = ?`, [
    //   email,
    //   id,
    // ]);
  }
}
