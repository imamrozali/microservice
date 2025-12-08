import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { Layout } from './components/Layout.js';
import {
  LoginPage,
  DashboardPage,
  EmployeesPage,
  EmployeeFormPage,
  AttendancePage,
  NotificationsPage,
} from './pages/index.js';
import { authService } from './services/authService.js';

// Root route without layout
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Layout route for authenticated pages
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => <Layout />,
});

const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: DashboardPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const employeesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/employees',
  component: EmployeesPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const employeeNewRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/employees/new',
  component: EmployeeFormPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const employeeEditRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/employees/$id/edit',
  component: EmployeeFormPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const attendanceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/attendance',
  component: AttendancePage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const notificationsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/notifications',
  component: NotificationsPage,
  beforeLoad: () => {
    if (!authService.isAuthenticated() || !authService.isAdmin()) {
      throw new Error('Unauthorized');
    }
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  layoutRoute.addChildren([
    indexRoute,
    employeesRoute,
    employeeNewRoute,
    employeeEditRoute,
    attendanceRoute,
    notificationsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: ({ error }) => {
    if (error.message === 'Unauthorized') {
      window.location.href = '/login';
      return null;
    }
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
