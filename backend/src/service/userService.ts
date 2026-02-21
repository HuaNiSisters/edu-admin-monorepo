import { UserRepositoryPrisma } from "../repositories/UserRepositoryPrisma.ts";

const UserRepository = new UserRepositoryPrisma();

async function getUserByIdAsync(userId: string) {
  const user = await UserRepository.getUserById(userId);
  return user;
}

export { getUserByIdAsync };
