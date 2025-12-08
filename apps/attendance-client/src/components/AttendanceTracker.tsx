import { useState, useEffect } from 'react'
import { attendanceService, type AttendanceEvent } from '../services'
import dayjs from '../utils/dayjs'

interface AttendanceTrackerProps {
    onAttendanceUpdate?: () => void
}

interface TodayAttendance {
    checkIn?: AttendanceEvent
    checkOut?: AttendanceEvent
    date: string
}

export function AttendanceTracker({ onAttendanceUpdate }: AttendanceTrackerProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [lastEvent, setLastEvent] = useState<AttendanceEvent | null>(null)
    const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null)

    useEffect(() => {
        loadTodayAttendance()
    }, [])

    const loadTodayAttendance = async () => {
        try {
            const today = dayjs().format('YYYY-MM-DD')
            const events = await attendanceService.getAttendanceEvents(today, today)

            const checkIn = events.find(event => event.eventType === 'check-in')
            const checkOut = events.find(event => event.eventType === 'check-out')

            setTodayAttendance({
                checkIn,
                checkOut,
                date: today
            })
        } catch (error) {
            console.error('Failed to load today attendance:', error)
        }
    }

    const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'))
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    }
                    setCurrentLocation(location)
                    resolve(location)
                },
                (error) => {
                    reject(new Error(`Location error: ${error.message}`))
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            )
        })
    }

    const handleCheckIn = async () => {
        if (todayAttendance?.checkIn) {
            setError('Anda sudah melakukan check-in hari ini')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const location = await getCurrentLocation()
            const event = await attendanceService.checkIn(location)
            setLastEvent(event)
            setTodayAttendance(prev => ({
                ...prev!,
                checkIn: event
            }))
            onAttendanceUpdate?.()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to check in')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCheckOut = async () => {
        if (!todayAttendance?.checkIn) {
            setError('Anda harus check-in terlebih dahulu sebelum check-out')
            return
        }

        if (todayAttendance?.checkOut) {
            setError('Anda sudah melakukan check-out hari ini')
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            const location = await getCurrentLocation()
            const event = await attendanceService.checkOut(location)
            setLastEvent(event)
            setTodayAttendance(prev => ({
                ...prev!,
                checkOut: event
            }))
            onAttendanceUpdate?.()
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to check out')
        } finally {
            setIsLoading(false)
        }
    }

    const formatDateTime = (timestamp: string) => {
        return dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss')
    }

    const formatTime = (timestamp: string) => {
        return dayjs(timestamp).format('HH:mm')
    }

    const getTodayStatus = () => {
        if (!todayAttendance?.checkIn) return 'Belum Check-in'
        if (!todayAttendance?.checkOut) return 'Sedang Bekerja'
        return 'Selesai Kerja'
    }

    const getStatusColor = () => {
        if (!todayAttendance?.checkIn) return 'text-red-600'
        if (!todayAttendance?.checkOut) return 'text-yellow-600'
        return 'text-green-600'
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Absen Hari Ini</h3>

            {/* Today's Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Status Hari Ini:</span>
                    <span className={`text-lg font-bold ${getStatusColor()}`}>
                        {getTodayStatus()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Check-in</p>
                        <p className="text-lg font-semibold text-green-600">
                            {todayAttendance?.checkIn ? formatTime(todayAttendance.checkIn.timestamp) : '-'}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-gray-500">Check-out</p>
                        <p className="text-lg font-semibold text-blue-600">
                            {todayAttendance?.checkOut ? formatTime(todayAttendance.checkOut.timestamp) : '-'}
                        </p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            )}

            {currentLocation && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">
                        📍 Location detected: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <button
                    onClick={handleCheckIn}
                    disabled={isLoading || !!todayAttendance?.checkIn}
                    className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-colors duration-200 ${todayAttendance?.checkIn
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        } ${isLoading ? 'opacity-50' : ''}`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            {todayAttendance?.checkIn ? 'Sudah Check In' : 'Check In'}
                        </>
                    )}
                </button>

                <button
                    onClick={handleCheckOut}
                    disabled={isLoading || !todayAttendance?.checkIn || !!todayAttendance?.checkOut}
                    className={`flex items-center justify-center px-6 py-4 rounded-lg font-medium transition-colors duration-200 ${!todayAttendance?.checkIn || todayAttendance?.checkOut
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } ${isLoading ? 'opacity-50' : ''}`}
                >
                    {isLoading ? (
                        <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                        </div>
                    ) : (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            {todayAttendance?.checkOut ? 'Sudah Check Out' : 'Check Out'}
                        </>
                    )}
                </button>
            </div>

            {lastEvent && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Last Activity</h4>
                    <div className="text-sm text-gray-600">
                        <p className="mb-1">
                            <span className="font-medium">Type:</span>{' '}
                            <span className={`px-2 py-1 rounded text-xs font-medium ${lastEvent.eventType === 'check-in'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                {lastEvent.eventType === 'check-in' ? 'Check In' : 'Check Out'}
                            </span>
                        </p>
                        <p className="mb-1">
                            <span className="font-medium">Time:</span> {formatDateTime(lastEvent.timestamp)}
                        </p>
                        {lastEvent.latitude && lastEvent.longitude && (
                            <p>
                                <span className="font-medium">Location:</span>{' '}
                                {lastEvent.latitude.toFixed(6)}, {lastEvent.longitude.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="mt-4 text-xs text-gray-500">
                <p>📱 Fitur ini menggunakan lokasi perangkat untuk verifikasi absen.</p>
                <p>🔒 Data lokasi hanya digunakan untuk keperluan absen.</p>
                <p>📅 Data yang dicapture: tanggal, waktu, status (masuk/pulang)</p>
            </div>
        </div>
    )
}