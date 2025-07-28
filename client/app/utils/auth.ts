// utils/auth.ts
function getTokenFromStorage(storage: Storage) {
  const authStorage = storage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state && state.token) {
        return state.token;
      }
    } catch (e) {
      console.error('Failed to parse auth storage', e);
    }
  }
  
  // Also check direct token storage
  const directToken = storage.getItem('access_token');
  if (directToken) {
    return directToken;
  }
  
  return null;
}

function getUserRoleFromStorage(storage: Storage) {
  const authStorage = storage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state && state.userRole) {
        return state.userRole;
      }
    } catch (e) {
      console.error('Failed to parse auth storage', e);
    }
  }
  
  // Also check direct role storage
  const directRole = storage.getItem('user_role');
  if (directRole) {
    return directRole;
  }
  
  return null;
}

function getTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value;
    }
  }
  return null;
}

function getUserRoleFromCookie() {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'user_role') {
      return value;
    }
  }
  return null;
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Priority: 1. localStorage, 2. Cookie, 3. sessionStorage (fallback)
  return getTokenFromStorage(localStorage) || 
         getTokenFromCookie() || 
         getTokenFromStorage(sessionStorage);
}

export function getUserRole() {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Priority: 1. localStorage, 2. Cookie, 3. sessionStorage (fallback)
  return getUserRoleFromStorage(localStorage) || 
         getUserRoleFromCookie() || 
         getUserRoleFromStorage(sessionStorage);
}

export function setAuthCookies(token: string, role: string, rememberMe: boolean = false) {
  // Set a much longer expiration for cookies to ensure they persist
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60; // 30 days or 24 hours
  
  // Don't use secure in development to avoid issues with HTTP
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  
  // Set cookies with proper attributes for cross-origin compatibility
  document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `user_role=${role}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  
  // Always sync with localStorage for redundancy
  const authData = {
    state: {
      token: token,
      userRole: role
    },
    version: 0
  };
  localStorage.setItem('auth-storage', JSON.stringify(authData));
  
  // Also set individual items for easier access
  localStorage.setItem('access_token', token);
  localStorage.setItem('user_role', role);
}

export function clearAuthCookies() {
  // Clear cookies with proper attributes
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax';
  document.cookie = 'user_role=; path=/; max-age=0; SameSite=Lax';
}

export function clearAllAuthData() {
  // Clear cookies
  clearAuthCookies();
  
  // Clear localStorage
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('username');
  localStorage.removeItem('user_role');
  localStorage.removeItem('access_token');
  
  // Clear sessionStorage (fallback)
  sessionStorage.removeItem('auth-storage');
  sessionStorage.removeItem('refresh_token');
}

// Helper function to make authenticated API calls
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAccessToken();

  // Build headers, but do NOT set Content-Type for FormData
  let headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  // Safely merge any additional headers
  if (options.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }

  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
    mode: 'cors'
  };

  try {
    const response = await fetch(url, config);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
