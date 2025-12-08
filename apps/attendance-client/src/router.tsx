import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { RootComponent } from './components/Root'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProfilePage } from './pages/ProfilePage'
import { AbsenPage } from './pages/AbsenPage'
import { SummaryPage } from './pages/SummaryPage'

// Root route
const rootRoute = createRootRoute({
    component: RootComponent,
})

// Index route - redirect based on auth status
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            throw redirect({ to: '/absen' })
        } else {
            throw redirect({ to: '/login' })
        }
    },
    component: () => <div>Redirecting...</div>,
})

// Login route - redirect to absen if already authenticated
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            throw redirect({ to: '/absen' })
        }
    },
    component: LoginPage,
})

// Home route - redirect to absen (legacy route)
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/home',
    beforeLoad: () => {
        throw redirect({ to: '/absen' })
    },
    component: () => <div>Redirecting...</div>,
})

// Profile route - protected
const profileRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/profile',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            throw redirect({ to: '/login' })
        }
    },
    component: ProfilePage,
})

// Absen route - protected
const absenRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/absen',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            throw redirect({ to: '/login' })
        }
    },
    component: AbsenPage,
})

// Summary route - protected
const summaryRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/summary',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            throw redirect({ to: '/login' })
        }
    },
    component: SummaryPage,
})

// 404 route - only accessible if user has token (for authenticated 404s)
const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/notfound',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            throw redirect({ to: '/login' })
        }
    },
    component: NotFoundPage,
})

// Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    loginRoute,
    homeRoute,
    profileRoute,
    absenRoute,
    summaryRoute,
    notFoundRoute,
])

// Create the router
export const router = createRouter({
    routeTree,
    defaultNotFoundComponent: () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            throw redirect({ to: '/notfound' })
        } else {
            throw redirect({ to: '/login' })
        }
    },
})