import { getActor } from "@/lib/auth/server";
import { UserRole } from "@/core/userRoles/types";
import { redirect } from "next/navigation";

export default async function Home() {
  const { role } = await getActor();
  if (role === UserRole.Tutor) redirect("/profile");
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        hello
      </div>
    </main>
  );
}
