import { createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router'
import { RootComponent } from './components/Root'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

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
            throw redirect({ to: '/home' })
        } else {
            throw redirect({ to: '/login' })
        }
    },
    component: () => <div>Redirecting...</div>,
})

// Login route - redirect to home if already authenticated
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            throw redirect({ to: '/home' })
        }
    },
    component: LoginPage,
})

// Home route - protected, redirect to login if not authenticated
const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/home',
    beforeLoad: () => {
        const token = localStorage.getItem('auth_token')
        if (!token) {
            throw redirect({ to: '/login' })
        }
    },
    component: HomePage,
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