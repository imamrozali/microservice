import { Users, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const users = await userService.getAllUsers();
      const totalEmployees = users.filter(u => u.is_active).length;
      setStats({
        totalEmployees
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's an overview of your system.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white overflow-hidden shadow-lg rounded-xl hover:shadow-xl transition-shadow">
          <div className="p-5 md:p-6">
            <div className="flex items-center">
              <div className="shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Employees
                </dt>
                <dd className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-linear-to-br from-white to-blue-50 shadow-lg rounded-xl p-6 md:p-8 border border-blue-100">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
          Welcome to Employee Monitor
        </h2>
        <p className="text-gray-600 mb-6 text-sm md:text-base">
          This portal allows you to manage employee data and monitor attendance records efficiently.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📋</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Employee Management</h3>
                <p className="text-sm text-gray-600">Add, update, or remove employee records</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-start">
              <span className="text-2xl mr-3">📊</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Attendance Monitoring</h3>
                <p className="text-sm text-gray-600">View attendance data</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-start">
              <span className="text-2xl mr-3">🔔</span>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Real-time Notifications</h3>
                <p className="text-sm text-gray-600">Get notified when users login</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
