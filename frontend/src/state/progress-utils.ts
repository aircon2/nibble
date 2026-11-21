export function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function currentStreak(dates: string[], today = new Date()): number {
  const completed = new Set(dates);
  const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!completed.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (completed.has(localDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
