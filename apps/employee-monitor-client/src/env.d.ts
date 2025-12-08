/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_SERVICE_URL: string;
  readonly VITE_USER_SERVICE_URL: string;
  readonly VITE_ATTENDANCE_SERVICE_URL: string;
  readonly VITE_EMPLOYEE_SERVICE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
