export function calculateCaretakerPoints(deadline: Date, closedAt: Date) {
  const deadlineTime = new Date(deadline).getTime();
  const closingTime = new Date(closedAt).getTime();

  if (deadlineTime >= closingTime) {
    return 100;
  }

  const diffInMs = closingTime - deadlineTime;
  const timeInHours = diffInMs / (60 * 60 * 1000);
  const timeInDays = Math.ceil(timeInHours / 24);

  const points = 100 - timeInDays * 10;

  return points <= 0 ? 0 : points;
}
