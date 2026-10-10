import { UserRepositoryPrisma } from "../repositories/UserRepositoryPrisma.js";

const UserRepository = new UserRepositoryPrisma();

async function getUserByIdAsync(userId: string) {
  const user = await UserRepository.getUserById(userId);
  return user;
}

export { getUserByIdAsync };
