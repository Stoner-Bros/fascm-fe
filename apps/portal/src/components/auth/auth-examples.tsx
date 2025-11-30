'use client';

import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

// Example component to demonstrate Zustand auth integration
export const UserProfile = () => {
  const {
    user,
    isAuthenticated,
    isLoading,
    userDisplayName,
    userRole,
    logout,
    updateProfile,
    refreshUserData
  } = useAuth();

  const [isUpdating, setIsUpdating] = useState(false);

  if (isLoading) {
    return <div className='p-4'>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className='p-4'>Please log in</div>;
  }

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        firstName: 'Updated',
        lastName: 'Name'
      });
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefreshData = async () => {
    try {
      await refreshUserData();
      alert('User data refreshed!');
    } catch (error) {
      alert('Failed to refresh data');
      console.error(error);
    }
  };

  return (
    <div className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'>
      <h2 className='mb-4 text-2xl font-bold'>User Profile</h2>

      <div className='mb-6 space-y-2'>
        <p>
          <strong>Name:</strong> {userDisplayName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {userRole || 'No role'}
        </p>
        <p>
          <strong>ID:</strong> {user.id}
        </p>
      </div>

      <div className='space-y-2'>
        <button
          onClick={handleUpdateProfile}
          disabled={isUpdating}
          className='w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isUpdating ? 'Updating...' : 'Update Profile'}
        </button>

        <button
          onClick={handleRefreshData}
          className='w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700'
        >
          Refresh Data
        </button>

        <button
          onClick={logout}
          className='w-full rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700'
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Example login form component
export const LoginForm = () => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login(credentials);
      alert('Login successful!');
    } catch (error) {
      alert('Login failed');
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='mx-auto max-w-md rounded-lg bg-white p-6 shadow-md'
    >
      <h2 className='mb-4 text-2xl font-bold'>Login</h2>

      <div className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Email
          </label>
          <input
            type='email'
            value={credentials.email}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, email: e.target.value }))
            }
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
            required
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            Password
          </label>
          <input
            type='password'
            value={credentials.password}
            onChange={(e) =>
              setCredentials((prev) => ({ ...prev, password: e.target.value }))
            }
            className='mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none'
            required
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  );
};

// Auth Guard component
interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const AuthGuard = ({
  children,
  requiredRole,
  fallback
}: AuthGuardProps) => {
  const { isAuthenticated, checkPermission, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <div>Please log in to access this content</div>;
  }

  if (requiredRole && !checkPermission(requiredRole)) {
    return (
      fallback || <div>You do not have permission to access this content</div>
    );
  }

  return <>{children}</>;
};
