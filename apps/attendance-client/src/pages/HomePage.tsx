import { useState, useEffect } from 'react'
import { userService, type User, type UpdatePasswordRequest, type UpdateProfileRequest } from '../services'
import { ProfileCard } from '../components/ProfileCard'
import { AttendanceTracker } from '../components/AttendanceTracker'
import { AttendanceHistory } from '../components/AttendanceHistory'

export function HomePage() {
    const [activeTab] = useState<'profile' | 'attendance' | 'history'>('profile')
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        try {
            setIsLoading(true)
            const userData = await userService.getCurrentUser()
            setUser(userData)
        } catch (error) {
            console.error('Failed to load user data:', error)
            setError('Failed to load user data')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateProfile = async (data: { phoneNumber: string; profilePicture?: File }) => {
        if (!user) return

        try {
            setIsUpdating(true)
            const updateData: UpdateProfileRequest = {
                phone_number: data.phoneNumber
            }

            const updatedUser = await userService.updateProfile(updateData)
            setUser(updatedUser)
        } catch (error) {
            console.error('Failed to update profile:', error)
            throw new Error('Failed to update profile')
        } finally {
            setIsUpdating(false)
        }
    }

    const handleUpdatePassword = async (data: { currentPassword: string; newPassword: string }) => {
        try {
            setIsUpdating(true)
            const updateData: UpdatePasswordRequest = {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            }

            await userService.updatePassword(updateData)
        } catch (error) {
            console.error('Failed to update password:', error)
            throw new Error('Failed to update password')
        } finally {
            setIsUpdating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Failed to load user data'}</p>
                    <button
                        onClick={loadUserData}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    const profileData = {
        id: user.id,
        fullName: user.employee?.fullName || 'N/A',
        email: user.email,
        position: user.employee?.position || 'N/A',
        phoneNumber: user.employee?.phoneNumber || '',
        employeeNumber: user.employee?.employeeNumber || 'N/A',
        profilePicture: user.employee?.profilePicture
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Employee Profile</h2>
                            <p className="text-gray-600">Manage your personal information and account settings</p>
                        </div>

                        <ProfileCard
                            profile={profileData}
                            onUpdateProfile={handleUpdateProfile}
                            onUpdatePassword={handleUpdatePassword}
                            isLoading={isUpdating}
                        />
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Absen</h2>
                            <p className="text-gray-600">Lakukan absen masuk dan pulang kantor</p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <AttendanceTracker onAttendanceUpdate={loadUserData} />
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Status Hari Ini</h3>
                                <p className="text-3xl font-bold text-green-600">Present</p>
                                <p className="text-sm text-gray-500 mt-1">Check-in terakhir: 08:30</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Bulan Ini</h3>
                                <p className="text-3xl font-bold text-blue-600">22</p>
                                <p className="text-sm text-gray-500 mt-1">Hari hadir</p>
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md text-center">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Rata-rata Jam</h3>
                                <p className="text-3xl font-bold text-purple-600">8.5</p>
                                <p className="text-sm text-gray-500 mt-1">Jam per hari</p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Summary Absen</h2>
                            <p className="text-gray-600">Lihat riwayat dan ringkasan kehadiran Anda</p>
                        </div>

                        <AttendanceHistory />
                    </div>
                )}
            </main>
        </div>
    )
}