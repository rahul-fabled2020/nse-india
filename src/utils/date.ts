export function formatDate(date: number | Date | string) {
  const today = new Date(date);

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(today.getDate()).padStart(2, "0")} ${String(
    today.getHours()
  ).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}:${String(
    today.getSeconds()
  ).padStart(2, "0")}`;
}