export function getCompletedDays() {
  return JSON.parse(localStorage.getItem("completedDays") || "{}");
}

export function setCompletedDay(day) {
  const completed = getCompletedDays();
  completed[day] = true;
  localStorage.setItem("completedDays", JSON.stringify(completed));
} 