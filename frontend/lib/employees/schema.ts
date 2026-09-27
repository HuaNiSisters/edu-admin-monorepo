import { z } from "zod";

export const EMPLOYEE_ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "reception", label: "Reception" },
  { value: "tutor", label: "Tutor" },
] as const;

const optionalText = (max = 200) => z.string().trim().max(max).transform(value => value || null);
const date = z.string().refine(value => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date.").transform(value => value || null);

export const personalDetailsShape = {
  date_of_birth: date,
  gender: z.enum(["", "female", "male", "other", "prefer_not_to_say"]).transform(value => value || null),
  address: optionalText(500),
  emergency_contact_name: optionalText(),
  emergency_contact_mobile: optionalText(40),
  high_school: optionalText(),
  university_course: optionalText(),
  working_with_children: optionalText(100),
  police_check: optionalText(200),
  special_skills: optionalText(2000),
  hsc_subjects: z.array(z.string().trim().min(1).max(150)).max(30)
    .transform(values => [...new Set(values)]),
};

export const employmentDetailsShape = {
  tfn: optionalText(40),
  account_name: optionalText(),
  bsb: z.string().trim().refine(value => !value || /^\d{3}[- ]?\d{3}$/.test(value), "BSB must contain six digits.")
    .transform(value => value.replace(/[- ]/g, "") || null),
  account_number: optionalText(40),
  super_name: optionalText(),
  super_member_number: optionalText(100),

  job: z.enum(["admin", "reception", "tutor"]),
  start_date: date,
  end_date: date,
  start_hourly_rate: z.string().trim().refine(value => !value || /^\d{1,6}(\.\d{1,2})?$/.test(value),
    "Enter a positive hourly rate with up to two decimal places.").transform(value => value ? Number(value) : null),
};

const phone = z.string().trim().min(1, "Enter a mobile number.").max(40);
const personal = z.object({ phone, ...personalDetailsShape }).strict();
const editable = z.object({ phone, ...personalDetailsShape, ...employmentDetailsShape }).strict();
const validEmploymentDates = (value: { start_date: string | null; end_date: string | null }) =>
  !value.start_date || !value.end_date || value.end_date >= value.start_date;
const dateError = { message: "End date must be on or after start date.", path: ["end_date"] };

export const updateEmployeeSchema = editable.refine(validEmploymentDates, dateError);
export const updateOwnProfileSchema = personal;
const employeeIdentityShape = {
  first_name: z.string().trim().min(1, "Enter a first name.").max(100),
  last_name: z.string().trim().min(1, "Enter a last name.").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(254),
};
export const createEmployeeRequiredSchema = z.object({
  ...employeeIdentityShape,
  phone,
  job: employmentDetailsShape.job,
}).strict();
export const createEmployeeSchema = z.object({
  ...createEmployeeRequiredSchema.shape,
  ...personalDetailsShape,
  ...employmentDetailsShape,
}).strict().refine(validEmploymentDates, dateError);

export const employeeFormSchemas = {
  create: createEmployeeSchema,
  admin: updateEmployeeSchema,
  self: updateOwnProfileSchema,
} as const;

export function employeeCreationInput(values: z.input<typeof createEmployeeRequiredSchema>) {
  return {
    ...Object.fromEntries(Object.keys(personalDetailsShape).map(key => [key, ""])),
    ...Object.fromEntries(Object.keys(employmentDetailsShape).map(key => [key, ""])),
    hsc_subjects: [],
    ...values,
  };
}

export type EmployeeDetails = z.output<typeof updateEmployeeSchema>;
export type EmployeeRecord = Partial<EmployeeDetails> & {
  tutor_id?: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
};

export const EMPLOYEE_SUMMARY_COLUMNS = "tutor_id, first_name, last_name, email, phone";
export const EMPLOYEE_DETAIL_COLUMNS = [...Object.keys(personalDetailsShape), ...Object.keys(employmentDetailsShape)].join(", ");