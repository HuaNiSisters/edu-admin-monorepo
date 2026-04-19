import { GetLocationsResponse } from "../api/types/campus";

import SupabaseApiWrapper from "../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function campusFunctions() {
  async function getLocationsAsync(): Promise<GetLocationsResponse> {
    return await apiWrapper.getLocationsAsync();
  }

  return {
    getLocationsAsync,
  };
}

const campusService = campusFunctions();
export default campusService;
