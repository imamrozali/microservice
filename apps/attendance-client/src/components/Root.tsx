import { Outlet, useLocation, Link } from '@tanstack/react-router'
import { User, LogIn as LogInIcon, LogOut, List, Menu, X } from 'lucide-react'
import { authService } from '../services/authService'
import { userService } from '../services/userService'
import { useState, useEffect } from 'react'

export function RootComponent() {
    const location = useLocation()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [user, setUser] = useState(authService.getUsers())
    const isAuthenticated = authService.isAuthenticated()

    useEffect(() => {
        const refreshUserProfile = async () => {
            try {
                const currentUser = authService.getUsers()
                if (currentUser?.id) {
                    const updatedUser = await userService.getCurrentUser()
                    
                    const refreshedUser = {
                        ...currentUser,
                        full_name: updatedUser.full_name || currentUser?.full_name || '',
                        email: updatedUser.email || currentUser?.email || '',
                        photo_url: updatedUser.photo_url || currentUser?.photo_url || '',
                        profile_picture: updatedUser.profile_picture || currentUser?.profile_picture || '',
                    }
                    authService.setUser(refreshedUser)
                    setUser(refreshedUser)
                    
                    console.log('Profile refreshed successfully')
                }
            } catch (error) {
                console.error('Failed to refresh profile:', error)
            }
        }

        if (isAuthenticated) {
            refreshUserProfile()
        }

        const handleProfileUpdate = () => {
            setUser(authService.getUsers())
        }

        window.addEventListener('profileUpdated', handleProfileUpdate)
        window.addEventListener('storage', handleProfileUpdate)

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate)
            window.removeEventListener('storage', handleProfileUpdate)
        }
    }, [isAuthenticated])

    const handleLogout = async () => {
        authService.logout()
        window.location.href = '/login'
    }

    const navItems = [
        { path: '/profile', label: 'Profil', icon: User },
        { path: '/absen', label: 'Absen', icon: LogInIcon },
        { path: '/summary', label: 'Summary Absen', icon: List },
    ]

    if (location.pathname === '/login' || !isAuthenticated) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
                <Outlet />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
            {/* Navigation */}
            <nav className="bg-white shadow-lg sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        {/* Logo and Desktop Navigation */}
                        <div className="flex items-center">
                            <div className="shrink-0 flex items-center">
                                <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg mr-3">
                                    WFH
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                    <span className="hidden sm:inline">Absensi WFH</span>
                                    <span className="sm:hidden">WFH</span>
                                </h1>
                            </div>

                            {/* Desktop Navigation Links */}
                            <div className="hidden md:ml-8 md:flex md:space-x-4 lg:space-x-8">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = location.pathname === item.path
                                    return (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                }`}
                                        >
                                            <Icon className="w-4 h-4 mr-2" />
                                            <span className="hidden lg:inline">{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>

                        {/* User Info and Logout (Desktop) */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || user?.email}
                                    </p>
                                </div>
                                <img
                                    src={user?.photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || user?.email}&size=128&background=3b82f6&color=fff`}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
                                />
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all shadow-sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden lg:inline">Logout</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex items-center md:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                                type="button"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="block h-6 w-6" />
                                ) : (
                                    <Menu className="block h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 bg-white">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center px-3 py-3 rounded-lg text-base font-medium transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-700'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile User Info */}
                        <div className="border-t border-gray-200 px-4 py-4">
                            <div className="flex items-center mb-3">
                                <img
                                    src={user?.photo_url || `https://ui-avatars.com/api/?name=${user?.full_name || user?.email}&size=128&background=3b82f6&color=fff`}
                                    alt="Profile"
                                    className="w-12 h-12 rounded-full border-2 border-white shadow-lg object-cover"
                                />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                        {user?.name || user?.email}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
                <div className="animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}