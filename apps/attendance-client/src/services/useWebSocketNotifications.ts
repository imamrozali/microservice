import { useEffect } from 'react';
import { io } from 'socket.io-client';

const useWebSocketNotifications = () => {
  useEffect(() => {
    const attendanceSocket = io('http://localhost:4003');
    const authSocket = io('http://localhost:4001');
    const employeeSocket = io('http://localhost:4002');

    attendanceSocket.on('attendance-activity', (data) => {
      console.log('Attendance Notification:', data);
    });

    authSocket.on('auth-activity', (data) => {
      console.log('Auth Notification:', data);
    });

    employeeSocket.on('employee-activity', (data) => {
      console.log('Employee Notification:', data);
    });

    return () => {
      attendanceSocket.disconnect();
      authSocket.disconnect();
      employeeSocket.disconnect();
    };
  }, []);
};

export default useWebSocketNotifications;