import { IPersonRepo } from "@/lib/api/interfaces/IPersonRepo";

function PersonService(personRepo: IPersonRepo) {
  async function getGendersAsync() {
    return await personRepo.getGendersAsync();
  }
  
  return {
    getGendersAsync,
  }
}

export default PersonService;