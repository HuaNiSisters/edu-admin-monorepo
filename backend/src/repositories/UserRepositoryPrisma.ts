import { prisma } from "../lib/prisma.ts";
import type { IUserRepository } from "../interfaces/UserRepository.ts";

export class UserRepositoryPrisma implements IUserRepository {
  async getUserById(id: string) {
    const user = await prisma.student.findUnique({
      where: { student_id: id }, 
    });
    return {
      // Have a function for mapping and filtering responses
      id: user?.student_id || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    };
  }
  async updateUserEmail(id: string, email: string) {
    return;
  }
}
