import { Outlet } from '@tanstack/react-router'

export function RootComponent() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Outlet />
        </div>
    )
}