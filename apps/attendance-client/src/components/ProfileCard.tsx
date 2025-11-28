import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'

interface ProfileData {
    id: string
    fullName: string
    email: string
    position: string
    phoneNumber: string
    employeeNumber: string
    profilePicture?: string
}

interface ProfileUpdateData {
    phoneNumber: string
    profilePicture?: File
}

interface PasswordUpdateData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

interface ProfileCardProps {
    profile: ProfileData
    onUpdateProfile: (data: ProfileUpdateData) => Promise<void>
    onUpdatePassword: (data: PasswordUpdateData) => Promise<void>
    isLoading?: boolean
}

export function ProfileCard({ profile, onUpdateProfile, onUpdatePassword, isLoading = false }: ProfileCardProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        formState: { errors: profileErrors },
        reset: resetProfile
    } = useForm<ProfileUpdateData>({
        defaultValues: {
            phoneNumber: profile.phoneNumber
        }
    })

    const {
        register: registerPassword,
        handleSubmit: handleSubmitPassword,
        formState: { errors: passwordErrors },
        reset: resetPassword,
        watch
    } = useForm<PasswordUpdateData>()

    const newPassword = watch('newPassword')

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmitProfile = async (data: ProfileUpdateData) => {
        try {
            const updateData: ProfileUpdateData = {
                phoneNumber: data.phoneNumber
            }

            if (fileInputRef.current?.files?.[0]) {
                updateData.profilePicture = fileInputRef.current.files[0]
            }

            await onUpdateProfile(updateData)
            setIsEditing(false)
            setPreviewImage(null)
        } catch (error) {
            console.error('Failed to update profile:', error)
        }
    }

    const onSubmitPassword = async (data: PasswordUpdateData) => {
        try {
            await onUpdatePassword(data)
            setIsChangingPassword(false)
            resetPassword()
        } catch (error) {
            console.error('Failed to update password:', error)
        }
    }

    const handleCancelEdit = () => {
        setIsEditing(false)
        setPreviewImage(null)
        resetProfile({ phoneNumber: profile.phoneNumber })
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <img
                            src={previewImage || profile.profilePicture || '/api/placeholder/150/150'}
                            alt={profile.fullName}
                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        />
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                {/* Profile Information */}
                <div className="flex-1 w-full">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{profile.fullName}</h2>
                        <div className="flex space-x-2">
                            {!isEditing && !isChangingPassword && (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    >
                                        Change Password
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {!isEditing && !isChangingPassword && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="text-gray-900">{profile.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Position</label>
                                <p className="text-gray-900">{profile.position}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Employee Number</label>
                                <p className="text-gray-900">{profile.employeeNumber}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                                <p className="text-gray-900">{profile.phoneNumber}</p>
                            </div>
                        </div>
                    )}

                    {/* Edit Profile Form */}
                    {isEditing && (
                        <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    {...registerProfile('phoneNumber', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[+]?[1-9][\d]{0,15}$/,
                                            message: 'Please enter a valid phone number'
                                        }
                                    })}
                                    type="tel"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {profileErrors.phoneNumber && (
                                    <p className="mt-1 text-sm text-red-600">{profileErrors.phoneNumber.message}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Change Password Form */}
                    {isChangingPassword && (
                        <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    {...registerPassword('currentPassword', {
                                        required: 'Current password is required'
                                    })}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {passwordErrors.currentPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    {...registerPassword('newPassword', {
                                        required: 'New password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {passwordErrors.newPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    {...registerPassword('confirmPassword', {
                                        required: 'Please confirm your new password',
                                        validate: (value) =>
                                            value === newPassword || 'Passwords do not match'
                                    })}
                                    type="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                                {passwordErrors.confirmPassword && (
                                    <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message}</p>
                                )}
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsChangingPassword(false)}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}