export const PRODUCTION_GOOGLE_CLIENT_ID =
  '207924374505-j49msabur5bvt5q2r79l7nu47djbs5rb.apps.googleusercontent.com';

export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || PRODUCTION_GOOGLE_CLIENT_ID;
}
