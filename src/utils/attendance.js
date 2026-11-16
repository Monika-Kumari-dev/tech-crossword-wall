import { getDeviceId } from "./access.js";
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

export function recordArrival(name, email, startGame = false, registration = {}) {
  const attendees = getAttendees();
  const key = email.trim().toLowerCase();
  const deviceId = registration.deviceId || getDeviceId();
  const existing = attendees.find((person) => person.email === key && person.deviceId === deviceId);
  const person = {
    ...existing,
    ...registration,
    deviceId,
    name: name.trim(),
    email: key,
    arrivedAt: existing?.arrivedAt || new Date().toISOString(),
    gamesStarted: (existing?.gamesStarted || 0) + (startGame ? 1 : 0),
    status: startGame ? "In progress" : existing?.status || "Checked in",
    ...(startGame ? { sessionId: registration.sessionId || crypto.randomUUID(), score: 0, questionsPlayed: 0, solvedCount: 0, seconds: 0, startedAt: registration.startedAt || new Date().toISOString(), endedAt: "" } : {}),
  };
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify([...attendees.filter((item) => item.email !== key || item.deviceId !== deviceId), person]));
  queueAttendee(person);
  return person;
}

export function updateAttendeeProgress(email, progress) {
  const key = email.trim().toLowerCase();
  const deviceId = getDeviceId();
  const attendees = getAttendees().map((person) => person.email === key && person.deviceId === deviceId ? { ...person, ...progress } : person);
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(attendees));
  const person = attendees.find((item) => item.email === key && item.deviceId === deviceId);
  const signature = `${person?.sessionId}/${person?.score}/${person?.questionsPlayed}`;
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
    ["Name", "Email ID", "Score", "Questions Played", "Session ID", "Started At", "Device"],
    ...attendees.map((person) => [person.name, person.email, person.score ?? 0, person.questionsPlayed ?? (person.score ?? 0) / 10, person.sessionId, person.startedAt, person.deviceId || "Legacy"]),
  ];
  const blob = new Blob(["\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ged-fy27-attendance-2026-11-17.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
