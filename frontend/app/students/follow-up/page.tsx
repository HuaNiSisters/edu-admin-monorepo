import { redirect } from "next/navigation";
import { UserRole } from "@/core/userRoles/types";
import { getActor } from "@/lib/auth/server";
import { FollowUpList } from "./follow-up-list";

type FollowUp = {
  follow_up_id: number;
  due_date: string;
  Payment: {
    receipt: string;
    Enrolment: {
      Student: { student_id: string; first_name: string; last_name: string } | null;
    } | null;
  } | null;
};

export default async function FollowUpPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] }>;
}) {
  const { role, supabase } = await getActor();
  if (role !== UserRole.Admin && role !== UserRole.Receptionist) {
    redirect("/forbidden");
  }

  const showCompleted = (await searchParams).status === "completed";
  const { data, error } = await supabase
    .from("PaymentFollowUp")
    .select("follow_up_id, due_date, Payment(receipt, Enrolment(Student(student_id, first_name, last_name)))")
    .eq("is_completed", showCompleted)
    .order("due_date", { ascending: !showCompleted })
    .order("follow_up_id", { ascending: !showCompleted })
    .overrideTypes<FollowUp[], { merge: false }>();

  const rows = (data ?? []).map(({ follow_up_id, due_date, Payment: payment }) => {
    const student = payment?.Enrolment?.Student;
    return {
      followUpId: follow_up_id,
      dueDate: due_date,
      receipt: payment?.receipt ?? null,
      studentId: student?.student_id ?? null,
      studentName: student ? `${student.first_name} ${student.last_name}` : "Student payment",
    };
  });

  return (
    <div className="min-w-0 space-y-4">
      <h1 className="text-2xl font-semibold">Follow-up</h1>
      <FollowUpList rows={rows} showCompleted={showCompleted} loadFailed={Boolean(error)} />
    </div>
  );
}
