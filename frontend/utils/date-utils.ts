
export function dateIsInTheFuture(date: Date) {
  const now = new Date();
  return date > now;
}

export function dateIsInThePast(date: Date) {
  const now = new Date();
  return date < now;
}