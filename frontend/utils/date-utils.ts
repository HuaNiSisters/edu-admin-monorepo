
export function dateIsInTheFuture(date: Date) {
  const now = new Date();
  return date > now;
}

export function dateIsInThePast(date: Date) {
  const now = new Date();
  return date < now;
}

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatDate = (date: string | null) => {
  if (!date) return "—";
  return dateFormatter.format(new Date(date));
};
