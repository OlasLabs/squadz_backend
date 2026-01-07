# Frontend: Automatic Token Renewal Implementation Guide

## Overview

The backend now implements **refresh token rotation** for enhanced security. This guide shows how to implement automatic token renewal in the React Native frontend using Axios interceptors.

---

## Backend Changes (Already Implemented)

### Token Rotation
- **Endpoint:** `POST /auth/refresh`
- **Input:** `{ refreshToken: string }`
- **Output:** `{ accessToken: string, refreshToken: string }`

**Key Change:** Backend now returns **BOTH** new access token and new refresh token on each refresh.

### Security Flow
1. Old refresh token is single-use only
2. After successful refresh, old token is deleted from database
3. New refresh token must be stored and used for next refresh
4. If old token is reused → automatic rejection (prevents replay attacks)

---

## Frontend Implementation

### 1. Axios Interceptor Setup

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'https://api.squadz.app', // Your API URL
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: Add access token to all requests
api.interceptors.request.use(
  async (config) => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and refresh tokens
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    // If error is NOT 401, reject immediately
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If already retried, reject (prevent infinite loop)
    if (originalRequest._retry) {
      // Clear tokens and redirect to login
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      // Trigger logout in your app state
      return Promise.reject(error);
    }

    // If currently refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Mark as retrying and start refresh process
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Get refresh token
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call refresh endpoint
      const response = await axios.post(
        'https://api.squadz.app/auth/refresh',
        { refreshToken }
      );

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Store NEW tokens (CRITICAL: both tokens are rotated)
      await SecureStore.setItemAsync('accessToken', newAccessToken);
      await SecureStore.setItemAsync('refreshToken', newRefreshToken);

      // Update authorization header
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests
      processQueue(null, newAccessToken);

      // Retry original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed - clear tokens and logout
      processQueue(refreshError, null);
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      
      // Trigger logout in your app (redirect to login screen)
      // Example: navigationRef.navigate('Login');
      
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
```

---

### 2. Usage in Your App

```typescript
import api from './api'; // Your configured axios instance

// All API calls automatically handle token refresh
const getUserProfile = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    // If token refresh fails, user is automatically logged out
    console.error('Failed to fetch user profile:', error);
    throw error;
  }
};
```

---

### 3. Login Flow

```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await axios.post('https://api.squadz.app/auth/login', {
      identifier: email,
      password,
    });

    const { accessToken, refreshToken, user } = response.data;

    // Store tokens securely
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);

    // Update axios default header
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    return user;
  } catch (error) {
    throw error;
  }
};
```

---

### 4. Logout Flow

```typescript
const logout = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    
    if (refreshToken) {
      // Notify backend to invalidate token
      await api.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    // Log error but continue logout
    console.error('Logout API call failed:', error);
  } finally {
    // Always clear local tokens
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    delete api.defaults.headers.common.Authorization;
    
    // Navigate to login screen
  }
};
```

---

## Critical Security Points

### ✅ DO:
1. **Always store BOTH tokens** after refresh (backend rotates both)
2. Store tokens in `SecureStore` (encrypted storage)
3. Clear tokens on logout or refresh failure
4. Use request queueing to prevent concurrent refresh calls
5. Redirect to login when refresh fails

### ❌ DON'T:
1. Store tokens in AsyncStorage (not encrypted)
2. Store tokens in app state (visible in debugger)
3. Reuse old refresh token after successful refresh
4. Expose tokens in logs or error messages
5. Skip the `_retry` flag (causes infinite loops)

---

## Testing Checklist

- [ ] Access token expires (15 min) → Automatic refresh works
- [ ] Multiple simultaneous 401s → Only one refresh call made
- [ ] Refresh token expires (30 days) → User logged out
- [ ] Network failure during refresh → User logged out
- [ ] Invalid refresh token → User logged out
- [ ] Token version mismatch (password changed elsewhere) → User logged out
- [ ] Tokens persisted after app restart
- [ ] Logout clears both tokens

---

## Token Lifespan

| Token Type | Lifespan | Storage | Rotation |
|---|---|---|---|
| Access Token | 15 minutes | SecureStore | No (short-lived) |
| Refresh Token | 30 days | SecureStore | Yes (every refresh) |

---

## Error Handling

### 401 Unauthorized
- **Cause:** Expired access token
- **Action:** Automatic refresh via interceptor
- **User Impact:** None (transparent)

### Refresh Fails
- **Cause:** Invalid/expired refresh token or network error
- **Action:** Clear tokens, redirect to login
- **User Impact:** Must re-authenticate

### Token Version Mismatch
- **Cause:** Password changed on another device
- **Action:** Refresh rejected, tokens cleared
- **User Impact:** Must re-login (expected security behavior)

---

## Related Backend Endpoints

- `POST /auth/login` - Returns initial access + refresh tokens
- `POST /auth/refresh` - Rotates both tokens
- `POST /auth/logout` - Invalidates refresh token
- `POST /auth/verify-email` - Returns tokens after email verification
- `POST /auth/oauth/google` - Returns tokens after OAuth
- `POST /auth/oauth/apple` - Returns tokens after OAuth

---

## Questions?

See `auth-strategy.mdc` for complete authentication specification.

