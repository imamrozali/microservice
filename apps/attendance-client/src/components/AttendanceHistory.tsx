import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { attendanceService, type AttendanceSummary } from '../services'
import dayjs from '../utils/dayjs'

interface DateRange {
    startDate: string
    endDate: string
}
export function AttendanceHistory() {
    const [attendanceData, setAttendanceData] = useState<AttendanceSummary[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue
    } = useForm<DateRange>()

    // Set default date range (start of month to today)
    useEffect(() => {
        const startDate = dayjs().startOf('month').format('YYYY-MM-DD')
        const endDate = dayjs().format('YYYY-MM-DD')

        setValue('startDate', startDate)
        setValue('endDate', endDate)

        // Load initial data
        loadAttendanceData(startDate, endDate)
    }, [setValue])

    const loadAttendanceData = async (startDate?: string, endDate?: string) => {
        try {
            setIsLoading(true)
            setError(null)
            const data = await attendanceService.getAttendanceSummary(startDate, endDate)
            setAttendanceData(data)
        } catch (error) {
            console.error('Failed to load attendance data:', error)
            setError('Failed to load attendance data')
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = (data: DateRange) => {
        loadAttendanceData(data.startDate, data.endDate)
    }

    const formatTime = (timestamp: string) => {
        return dayjs(timestamp).format('HH:mm')
    }

    const formatDate = (dateString: string) => {
        return dayjs(dateString).format('DD/MM/YYYY')
    }

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            present: { bg: 'bg-green-100', text: 'text-green-800', label: 'Present' },
            partial: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Partial' },
            absent: { bg: 'bg-red-100', text: 'text-red-800', label: 'Absent' }
        }

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        )
    }

    const calculateTotalHours = () => {
        return attendanceData.reduce((total, record) => total + (record.totalHours || 0), 0).toFixed(1)
    }

    const getTotalDaysPresent = () => {
        return attendanceData.filter(record => record.status === 'present').length
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Tanggal</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                From
                            </label>
                            <input
                                {...register('startDate', { required: 'Start date is required' })}
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                To
                            </label>
                            <input
                                {...register('endDate', { required: 'End date is required' })}
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? 'Searching...' : 'Cari'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Days Present</h4>
                    <p className="text-3xl font-bold text-green-600">{getTotalDaysPresent()}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Hours</h4>
                    <p className="text-3xl font-bold text-blue-600">{calculateTotalHours()}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Total Records</h4>
                    <p className="text-3xl font-bold text-purple-600">{attendanceData.length}</p>
                </div>
            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Summary Absen</h3>
                </div>

                {error && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {isLoading ? (
                    <div className="px-6 py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading attendance data...</p>
                    </div>
                ) : attendanceData.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No attendance records found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your date range filter.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Masuk
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pulang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total Jam
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {attendanceData.map((record, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(record.date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkIn ? (
                                                <span className="text-green-600 font-medium">
                                                    {formatTime(record.checkIn)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.checkOut ? (
                                                <span className="text-blue-600 font-medium">
                                                    {formatTime(record.checkOut)}
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {record.totalHours ? (
                                                <span className="font-medium">
                                                    {record.totalHours.toFixed(1)} jam
                                                </span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {getStatusBadge(record.status)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}