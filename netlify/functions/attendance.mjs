import { getStore } from '@netlify/blobs';
import { createAttendanceHandler } from '../../server/attendance-handler.js';

export default createAttendanceHandler(
  () => getStore({ name: `ged-fy27-attendance-${process.env.CONTEXT || 'production'}`, consistency: 'strong' }),
);
