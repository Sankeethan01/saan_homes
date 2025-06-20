// utils/auth.ts
export function getAccessToken() {
  return (
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token")
  );
}
export function getRefreshToken() {
  return (
    sessionStorage.getItem("refresh_token") ||
    localStorage.getItem("refresh_token")
  );
}
