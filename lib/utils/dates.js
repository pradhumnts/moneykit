const TIMEZONE = "Asia/Kolkata";

export function getTodayDateString(date = new Date()) {
  return formatDateInTimezone(date, "yyyy-mm-dd");
}

export function formatDateInTimezone(dateInput, pattern = "long") {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  if (pattern === "yyyy-mm-dd") {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((part) => part.type === "year")?.value;
    const month = parts.find((part) => part.type === "month")?.value;
    const day = parts.find((part) => part.type === "day")?.value;
    return `${year}-${month}-${day}`;
  }

  if (pattern === "short") {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  if (pattern === "time") {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getGreeting(date = new Date()) {
  const hourString = new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).format(date);
  const hour = Number(hourString);

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getDateGroupLabel(transactionDate, now = new Date()) {
  const today = getTodayDateString(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = getTodayDateString(yesterdayDate);

  if (transactionDate === today) return "Today";
  if (transactionDate === yesterday) return "Yesterday";

  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekStartString = getTodayDateString(weekStart);

  if (transactionDate >= weekStartString && transactionDate < today) {
    return "Earlier this week";
  }

  return formatDateInTimezone(`${transactionDate}T12:00:00`, "short");
}

export function isSameMonth(dateString, reference = new Date()) {
  const referenceParts = formatDateInTimezone(reference, "yyyy-mm-dd").split("-");
  const [year, month] = dateString.split("-");
  return year === referenceParts[0] && month === referenceParts[1];
}

export function parseDateString(dateString) {
  if (!dateString || typeof dateString !== "string") return undefined;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

export function toDateString(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateString) {
  const date = parseDateString(dateString);
  if (!date) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export { TIMEZONE };
