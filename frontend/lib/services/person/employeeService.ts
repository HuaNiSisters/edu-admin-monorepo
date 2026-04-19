import SupabaseApiWrapper from "../../api/adapters/supabaseAdapter";
const apiWrapper = new SupabaseApiWrapper();

function employeeFunctions() {
  async function getTutorsAsync() {
    return await apiWrapper.getTutorsAsync();
  }

  return {
    getTutorsAsync,
  };
}

const employeeService = employeeFunctions();
export default employeeService;
