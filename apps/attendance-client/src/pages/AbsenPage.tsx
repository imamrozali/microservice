import { useState, useEffect } from 'react';
import { Clock, MapPin, LogIn, LogOut, CheckCircle, Calendar } from 'lucide-react';
import { attendanceService } from '../services/attendanceService';
import dayjs from '../utils/dayjs';

export const AbsenPage = () => {
  const [loading, setLoading] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadTodayAttendance();
    getLocation();
    
    // Update clock every second
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  const loadTodayAttendance = async () => {
    try {
      const attendance = await attendanceService.getTodayAttendance();
      if (attendance) {
        setTodayAttendance(attendance);
      }
    } catch (error: any) {
      console.error('Error loading attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await attendanceService.checkIn({
        latitude: location?.lat,
        longitude: location?.lng,
      });

      setMessage({ type: 'success', text: 'Check-in berhasil!' });
      await loadTodayAttendance();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal check-in' });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      await attendanceService.checkOut({
        latitude: location?.lat,
        longitude: location?.lng,
      });

      setMessage({ type: 'success', text: 'Check-out berhasil!' });
      await loadTodayAttendance();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Gagal check-out' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: dayjs.Dayjs) => {
    return date.format('HH:mm:ss');
  };

  const formatDate = (date: dayjs.Dayjs) => {
    return date.format('dddd, DD MMMM YYYY');
  };

  const hasCheckedIn = todayAttendance?.check_in_time;
  const hasCheckedOut = todayAttendance?.check_out_time;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Absensi</h1>
        <p className="text-gray-600 mt-2">Lakukan absensi masuk dan pulang kantor</p>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg animate-fade-in ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Time Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 md:p-8 mb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <span className="text-sm md:text-base opacity-90">{formatDate(currentTime)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-sm opacity-90">
              <MapPin className="w-4 h-4" />
              <span>Lokasi Aktif</span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Clock className="w-8 h-8 md:w-10 md:h-10" />
            <div className="text-4xl md:text-6xl font-bold tracking-tight">
              {formatTime(currentTime)}
            </div>
          </div>
        </div>
      </div>

      {/* Status Card */}
      {todayAttendance && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Status Absensi Hari Ini
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hasCheckedIn && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <LogIn className="w-5 h-5" />
                  <span className="font-medium">Check-in</span>
                </div>
                <div className="text-2xl font-bold text-green-900">
                  {todayAttendance.check_in_time}
                </div>
                <div className="text-sm text-green-600 mt-1">
                  {dayjs(todayAttendance.attendance_date).format('DD MMMM YYYY')}
                </div>
              </div>
            )}
            
            {hasCheckedOut && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Check-out</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">
                  {todayAttendance.check_out_time}
                </div>
                <div className="text-sm text-blue-600 mt-1">
                  {dayjs(todayAttendance.attendance_date).format('DD MMMM YYYY')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleCheckIn}
          disabled={loading || hasCheckedIn}
          className={`p-6 rounded-xl shadow-lg transition-all text-white font-semibold text-lg flex flex-col items-center gap-3 ${
            hasCheckedIn
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-xl'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            hasCheckedIn ? 'bg-gray-400' : 'bg-white bg-opacity-20'
          }`}>
            <LogIn className="w-8 h-8" />
          </div>
          <span>{hasCheckedIn ? 'Sudah Check-in' : 'Check-in Masuk'}</span>
          {hasCheckedIn && (
            <span className="text-sm opacity-75">
              {todayAttendance?.check_in_time}
            </span>
          )}
        </button>

        <button
          onClick={handleCheckOut}
          disabled={loading || !hasCheckedIn || hasCheckedOut}
          className={`p-6 rounded-xl shadow-lg transition-all text-white font-semibold text-lg flex flex-col items-center gap-3 ${
            !hasCheckedIn || hasCheckedOut
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl'
          }`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            !hasCheckedIn || hasCheckedOut ? 'bg-gray-400' : 'bg-white bg-opacity-20'
          }`}>
            <LogOut className="w-8 h-8" />
          </div>
          <span>{hasCheckedOut ? 'Sudah Check-out' : 'Check-out Pulang'}</span>
          {hasCheckedOut && (
            <span className="text-sm opacity-75">
              {todayAttendance?.check_out_time}
            </span>
          )}
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Informasi</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Check-in dapat dilakukan saat Anda tiba di tempat kerja</li>
          <li>• Check-out dapat dilakukan setelah Anda check-in</li>
          <li>• Pastikan lokasi GPS aktif untuk akurasi data</li>
          <li>• Absensi hanya dapat dilakukan sekali per hari</li>
        </ul>
      </div>
    </div>
  );
};
