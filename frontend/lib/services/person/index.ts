import SupabaseApiWrapper from "../../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function personFunctions() {
  async function getGendersAsync() {
    return await apiWrapper.getGendersAsync();
  }
  
  return {
    getGendersAsync,
  }
}

const personService = personFunctions();
export default personService;