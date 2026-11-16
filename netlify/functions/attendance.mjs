import { getStore } from '@netlify/blobs';
import { createSecureAttendanceHandler } from '../../server/secure-attendance.js';

export default createSecureAttendanceHandler(
  (deviceId) => getStore({ name: `ged-fy27-attendance-${process.env.CONTEXT || 'production'}-device-${deviceId}`, consistency: 'strong' }),
);
