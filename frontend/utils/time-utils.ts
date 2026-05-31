
export const formatTime = (time: string) => {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minuteStr ?? "00"} ${period}`;
};
