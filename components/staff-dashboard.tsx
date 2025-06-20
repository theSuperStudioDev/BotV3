"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Settings, Users, MessageSquare, Activity, LogOut, Bot } from "lucide-react"
import { useAuth } from "../contexts/auth-context"

export default function StaffDashboard() {
  const { user, logout, botConfig } = useAuth()

  const hasPermission = (permissionId: string) => {
    return user?.permissions.some((p) => p.id === permissionId) || false
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold">Staff Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={botConfig.isRunning ? "default" : "secondary"}>
              {botConfig.isRunning ? "Bot Online" : "Bot Offline"}
            </Badge>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            {hasPermission("commands.view") && (
              <TabsTrigger value="commands">
                <MessageSquare className="h-4 w-4 mr-2" />
                Commands
              </TabsTrigger>
            )}
            {hasPermission("users.view") && (
              <TabsTrigger value="users">
                <Users className="h-4 w-4 mr-2" />
                Users
              </TabsTrigger>
            )}
            {hasPermission("settings.view") && (
              <TabsTrigger value="settings">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Your Permissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.permissions.length || 0}</div>
                  <p className="text-xs text-muted-foreground">Active permissions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Bot Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{botConfig.isRunning ? "Online" : "Offline"}</div>
                  <p className="text-xs text-muted-foreground">Current status</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Access Level</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Staff</div>
                  <p className="text-xs text-muted-foreground">Your role</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Permissions</CardTitle>
                <CardDescription>Permissions granted to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user?.permissions.map((permission) => (
                    <div key={permission.id} className="p-3 border rounded-lg">
                      <h3 className="font-medium text-sm">{permission.name}</h3>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {permission.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {hasPermission("commands.view") && (
            <TabsContent value="commands" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bot Commands</CardTitle>
                  <CardDescription>Available bot commands</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Command management interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {hasPermission("users.view") && (
            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage users</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">User management interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {hasPermission("settings.view") && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                  <CardDescription>System settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Settings interface would go here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
