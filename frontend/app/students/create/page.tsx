"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import StudentDataForm, {
  StudentFormInitialValues,
} from "@/components/_reusable-form-components/student-data-form";
import { Enquiry } from "@/lib/api/types/enquiry";
import { enquiryService } from "@/lib/services/enquiryService";

function enquiryToStudentValues(enquiry: Enquiry): StudentFormInitialValues {
  const gender = enquiry.gender?.toLowerCase();
  const location = enquiry.preferred_campus === "Parramatta"
    ? "parramatta"
    : enquiry.preferred_campus === "Cabramatta & Canley"
      ? "cabramatta_and_canley_vale"
      : "";

  return {
    firstName: enquiry.first_name,
    lastName: enquiry.surname,
    gender: gender === "female" ? "F" : gender === "male" ? "M" : "",
    email: enquiry.email_address ?? "",
    grade: String(enquiry.grade),
    school: enquiry.school,
    suburb: enquiry.suburb_of_home,
    location,
    mobile: enquiry.student_phone_number ?? "",
    parent1FullName: enquiry.parent_name ?? "",
    parent1Mobile: enquiry.parent_phone_number,
    parent2Mobile: enquiry.parent_2_phone_number ?? "",
    notes: enquiry.additional_comments ?? "",
  };
}

export default function CreateStudentPage() {
  const searchParams = useSearchParams();
  const enquiryId = searchParams.get("enquiryId");
  const [enquiry, setEnquiry] = useState<Enquiry | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enquiryId) return;
    enquiryService.getById(enquiryId)
      .then(setEnquiry)
      .catch(cause => setError(cause instanceof Error ? cause.message : "Unable to load enquiry."));
  }, [enquiryId]);

  const initialValues = useMemo(
    () => enquiry ? enquiryToStudentValues(enquiry) : undefined,
    [enquiry],
  );

  return (
    <div className="flex justify-center">
      <div className="w-full">
        {enquiryId && !enquiry && !error && <p role="status">Loading enquiry…</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {(!enquiryId || enquiry) && <StudentDataForm initialValues={initialValues} />}
      </div>
    </div>
  );
}
