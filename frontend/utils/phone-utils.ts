/** Format an Australian mobile as 04xx xxx xxx for display. */
export function formatPhoneNumber(value: string | null | undefined): string {
  if (!value) return "";

  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("0061") && digits.length === 13) {
    digits = `0${digits.slice(4)}`;
  } else if (digits.startsWith("61") && digits.length === 11) {
    digits = `0${digits.slice(2)}`;
  }

  if (digits.length > 10 || !digits.length) return value;
  return [digits.slice(0, 4), digits.slice(4, 7), digits.slice(7, 10)]
    .filter(Boolean)
    .join(" ");
}
