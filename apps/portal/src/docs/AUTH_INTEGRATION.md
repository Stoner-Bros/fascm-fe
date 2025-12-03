# Zustand Authentication Integration

## Cài đặt

```bash
npm install zustand
```

## Cấu trúc

```
src/
├── stores/
│   └── auth.store.ts          # Zustand auth store
├── services/
│   └── auth.service.ts        # Auth API service (đã tích hợp)
├── hooks/
│   └── use-auth.ts           # Custom auth hook
└── components/
    └── auth/
        └── auth-examples.tsx  # Ví dụ sử dụng
```

## Sử dụng cơ bản

### 1. Login Component

```tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

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
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert('Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='email'
        value={credentials.email}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, email: e.target.value }))
        }
        placeholder='Email'
        required
      />
      <input
        type='password'
        value={credentials.password}
        onChange={(e) =>
          setCredentials((prev) => ({ ...prev, password: e.target.value }))
        }
        placeholder='Password'
        required
      />
      <button type='submit' disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

### 2. User Profile Component

```tsx
import { useAuth } from '@/hooks/use-auth';

export const UserProfile = () => {
  const { user, isAuthenticated, userDisplayName, userRole, logout } =
    useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h2>Welcome, {userDisplayName}!</h2>
      <p>Email: {user?.email}</p>
      <p>Role: {userRole}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### 3. Auth Guard

```tsx
import { useAuth } from '@/hooks/use-auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const AuthGuard = ({ children, requiredRole }: AuthGuardProps) => {
  const { isAuthenticated, checkPermission, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  if (requiredRole && !checkPermission(requiredRole)) {
    return <div>Access denied</div>;
  }

  return <>{children}</>;
};
```

### 4. Sử dụng trong Layout/Page

```tsx
// app/layout.tsx hoặc _app.tsx
'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth store khi app load
    initialize();
  }, [initialize]);

  return (
    <html lang='en'>
      <body>{children}</body>
    </html>
  );
}
```

## API Reference

### useAuth Hook

```tsx
const {
  // State
  user, // Current user object
  isAuthenticated, // Boolean authentication status
  isLoading, // Loading state for async operations
  userDisplayName, // Formatted display name
  userRole, // User's role

  // Actions
  login, // (credentials) => Promise<AuthLoginResponse>
  logout, // () => void
  register, // (data) => Promise<AuthMeResponse>
  updateProfile, // (updates) => Promise<AuthMeResponse>
  refreshUserData, // () => Promise<AuthMeResponse>

  // Utilities
  checkPermission, // (role: string) => boolean
  hasRole // (role: string) => boolean
} = useAuth();
```

### Store Actions

```tsx
import { useAuthStore } from '@/stores/auth.store';

// Direct store access (advanced usage)
const setUser = useAuthStore((state) => state.setUser);
const clearAuth = useAuthStore((state) => state.clearAuth);
const syncFromCookie = useAuthStore((state) => state.syncFromCookie);
```

## Features

### ✅ Đã implement

- **Cookie-based persistence** với encryption
- **Automatic token refresh** (proactive)
- **Cross-tab synchronization**
- **SSR support**
- **Type-safe** với TypeScript
- **Zustand store** cho reactive state
- **Custom hooks** cho dễ sử dụng
- **Auth guards** cho route protection
- **Role-based permissions**

### 🔧 Tối ưu hóa

1. **Performance**: Memory cache + cookie persistence
2. **Security**: Encrypted cookies + automatic cleanup
3. **UX**: Seamless refresh + loading states
4. **DX**: Type safety + clear API

### 📝 Notes

- Store tự động sync với cookies
- Tokens được refresh proactive (trước khi hết hạn)
- Cross-tab logout được handle tự động
- DevTools support cho debugging

## Migration từ localStorage

Nếu bạn đang dùng localStorage, chỉ cần:

1. Thay `useAuthStore` thay vì đọc localStorage
2. Dùng `useAuth()` hook thay vì gọi auth service trực tiếp
3. Remove localStorage reads/writes (đã handle trong service)

Cookies sẽ tự động replace localStorage với better security!
