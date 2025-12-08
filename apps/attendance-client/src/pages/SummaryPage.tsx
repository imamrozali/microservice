import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, TrendingUp } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import dayjs from '../utils/dayjs';

export const SummaryPage = () => {
  const [loading, setLoading] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    // Set default date range: start of month to today
    const startDateStr = dayjs().startOf('month').format('YYYY-MM-DD');
    const endDateStr = dayjs().format('YYYY-MM-DD');

    setStartDate(startDateStr);
    setEndDate(endDateStr);

    loadAttendance(startDateStr, endDateStr);
  }, []);

  const loadAttendance = async (start: string, end: string) => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const data = await attendanceService.getAttendanceEvents(start, end);
      setAttendanceData(data);

      if (data.length === 0) {
        setMessage({ type: 'info', text: 'Tidak ada data absensi untuk periode yang dipilih' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal memuat data absensi' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Pilih tanggal mulai dan tanggal akhir' });
      return;
    }

    if (dayjs(startDate).isAfter(dayjs(endDate))) {
      setMessage({ type: 'error', text: 'Tanggal mulai tidak boleh lebih besar dari tanggal akhir' });
      return;
    }

    loadAttendance(startDate, endDate);
  };

  const formatDate = (dateString: string) => {

    return dayjs(dateString).format('DD MMMM YYYY');
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return dayjs(time).format('HH:mm');
  };

  const calculateStats = () => {
    const present = attendanceData.filter(a => a.check_in_time && a.check_out_time).length;
    const incomplete = attendanceData.filter(a => a.check_in_time && !a.check_out_time).length;
    const totalDays = attendanceData.length;

    return { present, incomplete, totalDays };
  };

  const stats = calculateStats();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Summary Absensi</h1>
        <p className="text-gray-600 mt-2">Lihat riwayat dan statistik absensi Anda</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              'bg-red-50 text-red-800 border border-red-200'
          }`}>
          {message.text}
        </div>
      )}

      {/* Filter Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Filter Tanggal (From - To)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-1 flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <Search className="w-4 h-4" />
              Cari
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {attendanceData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Hari</span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalDays}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Hadir Lengkap</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.present}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Tidak Lengkap</span>
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{stats.incomplete}</div>
          </div>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Masuk
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Pulang
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data absensi
                  </td>
                </tr>
              ) : (
                attendanceData.map((attendance, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(attendance.attendance_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatTime(attendance.check_in_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {formatTime(attendance.check_out_time)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${attendance.status === 'PULANG'
                          ? 'bg-green-100 text-green-800'
                          : attendance.status === 'MASUK'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                        {attendance.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
