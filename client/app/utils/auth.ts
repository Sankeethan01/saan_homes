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

// Check if the token is valid (not expired)
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if the token has an expiration claim
    if (!payload.exp) return false;
    
    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    console.error('Error validating token:', e);
    return false;
  }
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

export function clearRefreshToken() {
  // Clear refresh token cookie
  document.cookie = 'refresh_token=; path=/; max-age=0; SameSite=Lax';
  
  // Clear from localStorage
  localStorage.removeItem('refresh_token');
}

export function clearAllAuthData() {
  // Clear cookies
  clearAuthCookies();
  clearRefreshToken();
  
  // Clear localStorage
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('username');
  localStorage.removeItem('user_role');
  localStorage.removeItem('access_token');
  
  // Clear sessionStorage (fallback)
  sessionStorage.removeItem('auth-storage');
  sessionStorage.removeItem('refresh_token');
}

// Get refresh token from storage
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  // Try localStorage first
  const refreshToken = localStorage.getItem('refresh_token');
  if (refreshToken) {
    return refreshToken;
  }
  
  // Then check cookies
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'refresh_token') {
      return value;
    }
  }
  
  return null;
}

// Set refresh token
export function setRefreshToken(token: string, rememberMe: boolean = false) {
  // Set a much longer expiration for cookies to ensure they persist
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
  
  // Don't use secure in development to avoid issues with HTTP
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction ? '; Secure' : '';
  
  // Set cookie with proper attributes
  document.cookie = `refresh_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  
  // Also store in localStorage for redundancy
  localStorage.setItem('refresh_token', token);
}

// Get token expiration time in seconds
export function getTokenExpiration(token: string | null): number | null {
  if (!token) return null;
  
  try {
    // JWT tokens are in format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload
    const payload = JSON.parse(atob(parts[1]));
    
    // Return the expiration timestamp
    return payload.exp || null;
  } catch (e) {
    console.error('Error getting token expiration:', e);
    return null;
  }
}

// Refresh the access token using the refresh token
export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error('No refresh token available');
    return false;
  }
  
  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
    const response = await fetch(`${apiBaseUrl}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    
    if (!response.ok) {
      console.error('Token refresh failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    
    if (data.access) {
      // Get the current role
      const role = getUserRole();
      
      // Update the access token
      setAuthCookies(data.access, role || 'PUBLIC');
      console.log('Access token refreshed successfully');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// Set up a timer to refresh the token before it expires
export function setupTokenRefreshTimer(): void {
  if (typeof window === 'undefined') return;
  
  // Clear any existing timer
  const existingTimerId = window.localStorage.getItem('token_refresh_timer_id');
  if (existingTimerId) {
    clearTimeout(parseInt(existingTimerId));
  }
  
  const token = getAccessToken();
  const expiration = getTokenExpiration(token);
  
  if (!token || !expiration) return;
  
  // Calculate when to refresh (5 minutes before expiration)
  const now = Math.floor(Date.now() / 1000);
  const timeUntilRefresh = (expiration - now - 300) * 1000; // 5 minutes before expiry, in milliseconds
  
  // Only set timer if expiration is in the future
  if (timeUntilRefresh <= 0) {
    // Token is already expired or about to expire, refresh now
    refreshAccessToken();
    return;
  }
  
  // Set timer to refresh token
  const timerId = setTimeout(() => {
    console.log('Token refresh timer triggered');
    refreshAccessToken().then(success => {
      if (success) {
        // Set up the next timer after successful refresh
        setupTokenRefreshTimer();
      }
    });
  }, timeUntilRefresh);
  
  // Store timer ID to be able to clear it later
  window.localStorage.setItem('token_refresh_timer_id', timerId.toString());
  
  console.log(`Token refresh scheduled in ${Math.floor(timeUntilRefresh / 60000)} minutes`);
}

// Helper function to make authenticated API calls with token refresh
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = getAccessToken();

  // Build headers, but do NOT set Content-Type for FormData
  const headers: Record<string, string> = {
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
    const controller = new AbortController();
    
    // If no signal is provided, use our own with a default timeout
    if (!config.signal) {
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second default timeout
      config.signal = controller.signal;
      
      // Clean up timeout if fetch completes
      const cleanup = () => clearTimeout(timeoutId);
      setTimeout(cleanup, 30000);
    }
    
    // First attempt with current token
    let response = await fetch(url, config);
    
    // If unauthorized and we have a refresh token, try to refresh and retry
    if (response.status === 401 && getRefreshToken()) {
      console.log('Token expired, attempting refresh...');
      
      const refreshSuccess = await refreshAccessToken();
      
      if (refreshSuccess) {
        // Update token in headers
        token = getAccessToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          config.headers = headers;
          
          // Retry the request with new token
          console.log('Retrying request with new token...');
          response = await fetch(url, config);
        }
      }
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    
    // Add more detailed error logging
    if (error instanceof TypeError) {
      console.error('Network error - check server connection');
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request was aborted (timeout or manual cancel)');
    }
    
    throw error;
  }
}
