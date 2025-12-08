import { Outlet } from '@tanstack/react-router';
import { Navigation } from './Navigation.js';
import { useEffect } from 'react';
import { authService } from '../services/authService.js';
import { userService } from '../services/userService.js';

export const Layout = () => {
  // Refresh user profile data on mount/refresh
  useEffect(() => {
    const refreshUserProfile = async () => {
      try {
        const currentUser = authService.getUser();
        if (currentUser?.id) {
          // Fetch latest user data from server
          const updatedUser = await userService.getUserById(currentUser.id);
          
          // Update localStorage with latest data including photo_url
          authService.setUser({
            ...currentUser,
            full_name: updatedUser.full_name,
            email: updatedUser.email,
            photo_url: updatedUser.photo_url,
            role_id: updatedUser.role_id,
          });
          
          console.log('Profile refreshed successfully');
        }
      } catch (error) {
        console.error('Failed to refresh profile:', error);
      }
    };

    refreshUserProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl">
        <div className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
