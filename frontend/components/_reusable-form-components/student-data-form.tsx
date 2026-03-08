"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as zod from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import apiWrapper from "@/lib/apiWrapper";
import { SelectLocation } from "@/components/_reusable-form-components/select-location";
import { SelectStatus } from "@/components/_reusable-form-components/select-status";
import {
  Location,
  StudentStatus,
  Gender,
  StudentData,
  CreateStudentDataParams,
  CreateParentDataParams,
} from "@/types/IApiWrapper";
import { SelectGender } from "./select-gender";
import { toast } from "sonner";
import { useAsync } from "@/hooks/use-async";
import { useRouter } from "next/navigation";

const formSchema = zod.object({
  firstName: zod.string().min(1, "First name is required"),
  lastName: zod.string().min(1, "Last name is required"),
  preferredName: zod.string().optional(),
  gender: zod.string().nonempty("Gender is required"),
  email: zod
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),
  // grade: zod.number().min(7).max(12), // Hard-coded range validation check
  grade: zod.string().refine((value) => {
    const parsed = parseInt(value, 10);
    return !isNaN(parsed) && parsed >= 1 && parsed <= 12;
  }),
  school: zod.string().min(1, "School is required"),
  suburb: zod.string().min(1, "Suburb is required"),
  location: zod.string().nonempty("Location is required"),
  status: zod.string().nonempty("Status is required"),
  notes: zod.string().optional(),
  mobile: zod.string().min(1, "Mobile number is required"),
  parent1FullName: zod.string().nonempty("Full name of one parent is required"),
  parent1Mobile: zod
    .string()
    .nonempty("Mobile number of one parent is required"),
  parent2FullName: zod.string().optional(),
  parent2Mobile: zod.string().optional(),
});

const StudentDataForm = ({
  studentData,
  isEditing,
}: {
  studentData?: StudentData;
  isEditing?: boolean;
}) => {
  const isEditMode = !!studentData && isEditing;
  const isViewingMode = !!studentData && !isEditing;

  const [studentId, setStudentId] = useState<string>("");
  const [parent1Id, setParent1Id] = useState<string>("");
  const [parent2Id, setParent2Id] = useState<string>("");

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredName: "",
      gender: "",
      email: "",
      grade: "",
      school: "",
      location: "",
      status: "Attending",
      notes: "",
      mobile: "",
      suburb: "",
      parent1FullName: "",
      parent1Mobile: "",
      parent2FullName: "",
      parent2Mobile: "",
    },
  });

  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [statusOptions, setStatusOptions] = useState<string[]>([]);
  const [genderOptions, setGenderOptions] = useState<string[]>([]);

  useEffect(() => {
    async function fetchAndPopulate() {
      const [fetchedLocations, fetchedStatuses, fetchedGenders] =
        await Promise.all([
          apiWrapper.getLocationsAsync(),
          apiWrapper.getStatusesAsync(),
          apiWrapper.getGendersAsync(),
        ]);
      setLocationOptions(fetchedLocations);
      setStatusOptions(fetchedStatuses);
      setGenderOptions(fetchedGenders);

      if (studentData) {
        const {
          student_id,
          first_name,
          last_name,
          preferred_name,
          gender,
          email,
          grade_at_school,
          school,
          location,
          status,
          notes,
          student_mobile,
          suburb_of_home,
          parent1Id,
          parent1FullName,
          parent1Mobile,
          parent2Id,
          parent2FullName,
          parent2Mobile,
        } = studentData;

        setStudentId(student_id || "");
        setParent1Id(parent1Id || "");
        setParent2Id(parent2Id || "");
        form.setValue("firstName", first_name || "");
        form.setValue("lastName", last_name || "");
        form.setValue("preferredName", preferred_name || "");
        form.setValue("gender", gender || "");
        form.setValue("email", email || "");
        form.setValue("grade", grade_at_school?.toString() ?? "");
        form.setValue("school", school || "");
        form.setValue("location", location || "");
        form.setValue("status", status || "");
        form.setValue("notes", notes || "");
        form.setValue("mobile", student_mobile || "");
        form.setValue("suburb", suburb_of_home || "");
        form.setValue("parent1FullName", parent1FullName || "");
        form.setValue("parent1Mobile", parent1Mobile || "");
        form.setValue("parent2FullName", parent2FullName || "");
        form.setValue("parent2Mobile", parent2Mobile || "");
      }
    }
    fetchAndPopulate();
  }, [studentData]);

  const { run, isPending, error } = useAsync();
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  useEffect(() => {
    if (form.formState.isSubmitSuccessful && !isEditMode && !submissionError) {
      form.reset();
    }
  }, [submissionError]);

  async function onSubmit(data: zod.infer<typeof formSchema>) {
    const studentData: CreateStudentDataParams = {
      first_name: data.firstName,
      last_name: data.lastName,
      preferred_name: data.preferredName,
      gender: data.gender as Gender,
      email: data.email,
      grade_at_school: Number(data.grade),
      school: data.school,
      location: data.location as Location,
      status: data.status as StudentStatus,
      notes: data.notes,
      suburb_of_home: data.suburb,
      student_mobile: data.mobile,
    };

    const parent1Data: CreateParentDataParams = {
      // full_name: data.parent1FullName,
      parent_id: parent1Id,
      first_name: data.parent1FullName,
      last_name: "",
      parent_mobile: data.parent1Mobile,
    };

    const parent2Data: CreateParentDataParams = {
      // full_name: data.parent2FullName,
      parent_id: parent2Id,
      first_name: data.parent2FullName || "",
      last_name: "",
      parent_mobile: data.parent2Mobile || "",
    };

    run(async () => {
      if (isEditMode) {
        await apiWrapper.updateStudentAsync(studentId, {
          studentData,
          parent1Data,
          parent2Data,
        });
        if (error) {
          setSubmissionError(error.message);
        }
        toast.success("Student updated successfully!", {
          position: "top-center",
        });
        router.replace(`/student/${studentId}`);
        return;
      }

      const createStudentResponse = await apiWrapper.createStudentAsync({
        studentData,
        parent1Data,
        parent2Data,
      });
      if (error) {
        setSubmissionError(error.message);
      }
      toast.success("Student created successfully!", {
        position: "top-center",
      });
      router.replace(`/student/${createStudentResponse?.student_id}`);
      return;
    });
  }

  return (
    <form
      id="student-data-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="w-full"
    >
      <div>
        <div className="grid grid-cols-4 gap-5">
          <div className="mt-8 col-span-4 flex justify-between">
            <span className="text-xl font-bold">Student info</span>
            {isViewingMode && (
              <Button
                type="button"
                onClick={() => router.push(`/student/update/${studentId}`)}
              >
                Edit
              </Button>
            )}
          </div>

          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-name">
                  First name
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-name"
                  placeholder="Student's First Name"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-last-name">
                  Last name
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-last-name"
                  placeholder="Student's Last Name"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-email">
                  Email
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-email"
                  type="email"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-mobile">
                  Mobile
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-mobile"
                  placeholder="Student's Mobile Number"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="location"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-location">
                  Location
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <SelectLocation
                  key={field.value}
                  options={locationOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="grade"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-grade">
                  Grade at school
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-grade"
                  type="number"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="school"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-school">
                  School
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-school"
                  type="text"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="suburb"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-suburb">
                  Suburb of home
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="student-suburb"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-status">
                  Status
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <SelectStatus
                  key={field.value}
                  options={statusOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="gender"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-gender">
                  Gender
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <SelectGender
                  key={field.value}
                  options={genderOptions}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="preferredName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="student-preferred-name">
                  Preferred name
                </FieldLabel>
                <Input
                  id="student-preferred-name"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <div className="col-span-2">
            <Controller
              name="notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="student-notes">Notes</FieldLabel>
                  <Textarea
                    id="student-notes"
                    placeholder="Additional notes"
                    {...field}
                    disabled={isViewingMode}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>

          <div className="text-xl font-bold mt-8 col-span-4">Parents' info</div>
          <Controller
            name="parent1FullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="parent1-full-name">
                  Parent 1 Full Name
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="parent1-full-name"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="parent1Mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="parent1-mobile">
                  Parent 1 Mobile
                  <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  id="parent1-mobile"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="parent2FullName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="parent2-full-name">
                  Parent 2 Full Name
                </FieldLabel>
                <Input
                  id="parent2-full-name"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="parent2Mobile"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor="parent2-mobile">
                  Parent 2 Mobile
                </FieldLabel>
                <Input
                  id="parent2-mobile"
                  {...field}
                  disabled={isViewingMode}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>
      </div>

      <br />

      <div className="py-5" hidden={isViewingMode}>
        <Field orientation="horizontal">
          <Button type="submit" form="student-data-form" disabled={isPending}>
            {isPending
              ? "In progress..."
              : isEditMode
                ? "Update Student"
                : "Create Student"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => form.reset()}
            disabled={isPending}
          >
            Reset
          </Button>
        </Field>
      </div>
    </form>
  );
};

export default StudentDataForm;
