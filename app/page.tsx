"use client"

import { AuthProvider, useAuth } from "../contexts/auth-context"
import DiscordLogin from "../components/discord-login"
import OwnerDashboard from "../components/owner-dashboard"
import StaffDashboard from "../components/staff-dashboard"
import UserDashboard from "../components/user-dashboard"

function AppContent() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Authenticating with Discord...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <DiscordLogin />
  }

  switch (user.role) {
    case "owner":
      return <OwnerDashboard />
    case "staff":
      return <StaffDashboard />
    case "user":
      return <UserDashboard />
    default:
      return <DiscordLogin />
  }
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
