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
  return null;
}

export function getAccessToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  // This should match the logic in useAuthStore's custom storage
  return getTokenFromStorage(localStorage) || getTokenFromStorage(sessionStorage);
}

export function getRefreshToken() {
  return (
    sessionStorage.getItem("refresh_token") ||
    localStorage.getItem("refresh_token")
  );
}
