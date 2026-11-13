import { useEffect, useState } from 'react';
import { flushAttendance } from '../utils/attendanceSync';

export default function AttendanceSyncStatus() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    const update = (event) => setMessage(event.detail);
    window.addEventListener('attendance-sync', update);
    window.addEventListener('online', flushAttendance);
    const interval = setInterval(flushAttendance, 10000);
    void flushAttendance();
    return () => {
      window.removeEventListener('attendance-sync', update);
      window.removeEventListener('online', flushAttendance);
      clearInterval(interval);
    };
  }, []);
  return message ? <p className="sync-status" role="status">{message}</p> : null;
}
