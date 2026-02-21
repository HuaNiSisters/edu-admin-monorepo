import { getOrgByIdAsync } from "../../../../backend/service/orgService";

export async function GET(request: Request) {
  const org = await getOrgByIdAsync("8debf401-fb17-49bf-ba54-06f080f82f31");

  return new Response(JSON.stringify(org), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}