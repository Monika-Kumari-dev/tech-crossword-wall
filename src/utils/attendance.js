import { queueAttendee } from "./attendanceSync.js";
let lastQueuedProgress = "";
const ATTENDANCE_KEY = "ged-fy27-attendees";

export function getAttendees() {
  try {
    const value = JSON.parse(localStorage.getItem(ATTENDANCE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function recordArrival(name, email, startGame = false) {
  const attendees = getAttendees();
  const key = email.trim().toLowerCase();
  const existing = attendees.find((person) => person.email === key);
  const person = {
    ...existing,
    name: name.trim(),
    email: key,
    arrivedAt: existing?.arrivedAt || new Date().toISOString(),
    gamesStarted: (existing?.gamesStarted || 0) + (startGame ? 1 : 0),
    status: startGame ? "In progress" : existing?.status || "Checked in",
    ...(startGame ? { sessionId: crypto.randomUUID(), score: 0, solvedCount: 0, seconds: 0, startedAt: new Date().toISOString(), endedAt: "" } : {}),
  };
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([...attendees.filter((item) => item.email !== key), person]));
  queueAttendee(person);
  return person;
}

export function updateAttendeeProgress(email, progress) {
  const key = email.trim().toLowerCase();
  const attendees = getAttendees().map((person) => person.email === key ? { ...person, ...progress } : person);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendees));
  const person = attendees.find((item) => item.email === key);
  const signature = `${person?.sessionId}/${person?.score}`;
  if (signature !== lastQueuedProgress) {
    queueAttendee(person);
    lastQueuedProgress = signature;
  }
}

export function attendanceSummary(attendees) {
  return {
    arrived: attendees.length,
    played: attendees.filter((person) => person.gamesStarted > 0).length,
    completed: attendees.filter((person) => person.status === "Completed").length,
    endedEarly: attendees.filter((person) => person.status === "Ended early").length,
  };
}

// Excel opens CSV files. Prefix formula-like text to keep attendee input literal.
export function csvCell(value) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function exportAttendance(attendees) {
  const rows = [
    ["Name", "Email ID", "Score"],
    ...attendees.map((person) => [person.name, person.email, person.score ?? 0]),
  ];
  const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ged-fy27-attendance-2026-11-17.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
