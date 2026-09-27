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

/** Convert an Australian mobile to E.164 for the SMS provider. */
export function toSmsPhoneNumber(value: string | null | undefined): string | null {
  if (!value) return null;

  const digits = value.replace(/\D/g, "");
  if (/^04\d{8}$/.test(digits)) return `+61${digits.slice(1)}`;
  if (/^614\d{8}$/.test(digits)) return `+${digits}`;
  if (/^00614\d{8}$/.test(digits)) return `+${digits.slice(2)}`;
  return null;
}
