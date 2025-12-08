import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from '@tanstack/react-router';
import { userService, type CreateUserDto, type UpdateUserDto } from '../services/userService.js';
import { roleService, type Role } from '../services/roleService.js';
import { ArrowLeft, Save, Camera, Loader } from 'lucide-react';

type EmployeeFormData = CreateUserDto & Partial<UpdateUserDto>;

export const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const employeeId = params?.id as string | null;
  const isEditMode = !!employeeId;

  const [loading, setLoading] = useState(false);
  const [loadingEmployee, setLoadingEmployee] = useState(isEditMode);
  const [error, setError] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormData>();

  useEffect(() => {
    loadRoles();
    if (isEditMode && employeeId) {
      loadEmployee(employeeId);
    }
  }, [isEditMode, employeeId]);

  const loadRoles = async () => {
    try {
      const rolesData = await roleService.getAllRoles();
      setRoles(rolesData);
    } catch (err: any) {
      console.error('Failed to load roles:', err);
    }
  };

  const loadEmployee = async (id: string) => {
    try {
      setLoadingEmployee(true);
      const employee = await userService.getUserById(id);
      reset({
        email: employee.email,
        full_name: employee.full_name,
        job_position: employee.job_position,
        phone_number: employee.phone_number || '',
        role_id: employee.role_id,
        is_active: employee.is_active,
      } as UpdateUserDto);

      // Load profile picture if exists - photoUrl is already included in getUserById response
      if (employee.photoUrl) {
        setPreviewUrl(employee.photoUrl);
      } else if (employee.profile_picture) {
        // Fallback: fetch photo URL separately if not included in response
        try {
          const photoData = await userService.getProfilePhoto(id);
          setPreviewUrl(photoData.photoUrl);
        } catch (error) {
          console.error('Failed to load profile photo:', error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load employee');
    } finally {
      setLoadingEmployee(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size must be less than 2MB');
        return;
      }
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      setError('');
      setLoading(true);

      let userId = employeeId;

      if (isEditMode && employeeId) {
        // Remove password field for update
        const { password, ...updateData } = data;
        await userService.updateUser(employeeId, updateData as UpdateUserDto);
      } else {
        const newUser = await userService.createUser(data as CreateUserDto);
        userId = newUser.id;
      }

      // Upload profile picture if changed
      if (profilePicture && userId) {
        const photoData = await userService.uploadProfilePicture(userId, profilePicture);
        // Update preview with the actual photoUrl from server
        setPreviewUrl(photoData.photoUrl);
      }

      navigate({ to: '/employees' });
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} employee`);
    } finally {
      setLoading(false);
    }
  };

  if (loadingEmployee) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <button
          onClick={() => navigate({ to: '/employees' })}
          className="inline-flex items-center text-sm text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Employees
        </button>
      </div>

      <div className="bg-white shadow-2xl rounded-2xl max-w-3xl mx-auto overflow-hidden">
        <div className="bg-linear-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6 space-y-6">
          {error && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <svg className="w-5 h-5 text-red-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Profile Picture Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={previewUrl || `https://ui-avatars.com/api/?name=${employeeId || 'New'}&size=128&background=6366f1&color=fff`}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-indigo-100 shadow-lg object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all transform hover:scale-105">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('full_name', { required: 'Full name is required' })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {!isEditMode && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password', {
                      required: !isEditMode ? 'Password is required' : false,
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                    className="block w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Job Position *
              </label>
              <input
                type="text"
                {...register('job_position', { required: 'Job position is required' })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
              {errors.job_position && (
                <p className="mt-1 text-sm text-red-600">{errors.job_position.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                {...register('phone_number')}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="role_id" className="block text-sm font-semibold text-gray-700 mb-1">
                Role *
              </label>
              <select
                id="role_id"
                {...register('role_id', {
                  required: 'Role is required',
                })}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              >
                <option value="">Select role...</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              {errors.role_id && (
                <p className="mt-1 text-sm text-red-600">{errors.role_id.message}</p>
              )}
            </div>

            {isEditMode && (
              <div>
                <label htmlFor="is_active" className="block text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="is_active"
                  {...register('is_active', { valueAsNumber: false })}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate({ to: '/employees' })}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditMode ? 'Update' : 'Create'} Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
