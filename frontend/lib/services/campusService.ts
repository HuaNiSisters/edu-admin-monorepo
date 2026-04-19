import { ICampusRepo } from "../api/interfaces";
import { GetLocationsResponse } from "../api/types/campus";

function CampusService(campusRepo: ICampusRepo) {
  async function getLocationsAsync(): Promise<GetLocationsResponse> {
    return await campusRepo.getLocationsAsync();
  }

  return {
    getLocationsAsync,
  };
}

export default CampusService;
