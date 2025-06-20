"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Crown,
  Users,
  Settings,
  Bot,
  Play,
  Square,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Activity,
  Loader2,
  Server,
  MessageSquare,
  Eye,
  EyeOff,
  Copy,
  Check,
  ExternalLink,
  Globe,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import { availablePermissions } from "../data/permissions"
import type { User, Permission } from "../types/auth"
import BotConsole from "./bot-console"

export default function OwnerDashboard() {
  const {
    user,
    users,
    botConfig,
    guilds,
    commands,
    logout,
    addUser,
    updateUserPermissions,
    removeUser,
    updateBotConfig,
    startBot,
    stopBot,
    addCommand,
    updateCommand,
    deleteCommand,
  } = useAuth()

  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [isEditUserOpen, setIsEditUserOpen] = useState(false)
  const [isAddCommandOpen, setIsAddCommandOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUserData, setNewUserData] = useState({ username: "", discordId: "", role: "user" as const })
  const [newCommand, setNewCommand] = useState({
    name: "",
    description: "",
    usage: "",
    category: "utility",
    enabled: true,
  })
  const [botStarting, setBotStarting] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState("")

  useEffect(() => {
    setCurrentUrl(window.location.origin)
  }, [])

  const handleStartBot = async () => {
    if (!botConfig.token) {
      alert("Please set a bot token first!")
      return
    }

    // Add to console
    if ((window as any).addBotLog) {
      ;(window as any).addBotLog("info", "Starting bot...", "system")
    }

    setBotStarting(true)
    const success = await startBot()

    if (success) {
      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("success", "Bot started successfully!", "system")
      }
    } else {
      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("error", "Failed to start bot", "system")
      }
    }

    setBotStarting(false)
  }

  const handleCopyToken = async () => {
    if (botConfig.token) {
      await navigator.clipboard.writeText(botConfig.token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyInviteLink = async () => {
    if (botConfig.clientId) {
      const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${botConfig.clientId}&permissions=8&scope=bot%20applications.commands`
      await navigator.clipboard.writeText(inviteUrl)
      alert("Bot invite link copied to clipboard!")
    }
  }

  const handleAddUser = () => {
    if (!newUserData.username || !newUserData.discordId) return

    addUser({
      ...newUserData,
      permissions: newUserData.role === "staff" ? availablePermissions.filter((p) => p.category !== "users") : [],
    })
    setNewUserData({ username: "", discordId: "", role: "user" })
    setIsAddUserOpen(false)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditUserOpen(true)
  }

  const handleUpdatePermissions = (permission: Permission, checked: boolean) => {
    if (!selectedUser) return

    const updatedPermissions = checked
      ? [...selectedUser.permissions, permission]
      : selectedUser.permissions.filter((p) => p.id !== permission.id)

    updateUserPermissions(selectedUser.id, updatedPermissions)
    setSelectedUser({ ...selectedUser, permissions: updatedPermissions })
  }

  const handleAddCommand = () => {
    if (!newCommand.name || !newCommand.description) return

    addCommand({
      ...newCommand,
      permissions: [],
    })
    setNewCommand({
      name: "",
      description: "",
      usage: "",
      category: "utility",
      enabled: true,
    })
    setIsAddCommandOpen(false)
  }

  const groupedPermissions = availablePermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    },
    {} as Record<string, Permission[]>,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="h-8 w-8 text-purple-600" />
              <img src={user?.avatar || "/placeholder.svg"} alt={user?.username} className="h-8 w-8 rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Owner Dashboard</h1>
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="bot">
              <Bot className="h-4 w-4 mr-2" />
              Bot Control
            </TabsTrigger>
            <TabsTrigger value="commands">
              <MessageSquare className="h-4 w-4 mr-2" />
              Commands
            </TabsTrigger>
            <TabsTrigger value="servers">
              <Server className="h-4 w-4 mr-2" />
              Servers
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Bot Servers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{botConfig.guildCount || guilds.length}</div>
                  <p className="text-xs text-muted-foreground">Connected servers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{botConfig.userCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all servers</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{commands.filter((c) => c.enabled).length}</div>
                  <p className="text-xs text-muted-foreground">Active commands</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleStartBot}
                    disabled={botConfig.isRunning || !botConfig.token || botStarting}
                    className="w-full justify-start"
                  >
                    {botStarting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {botStarting ? "Starting Bot..." : "Start Bot"}
                  </Button>
                  <Button
                    onClick={stopBot}
                    disabled={!botConfig.isRunning}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Bot
                  </Button>
                  <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Grant access to a new user</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={newUserData.username}
                            onChange={(e) => setNewUserData({ ...newUserData, username: e.target.value })}
                            placeholder="Enter username"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="discordId">Discord ID</Label>
                          <Input
                            id="discordId"
                            value={newUserData.discordId}
                            onChange={(e) => setNewUserData({ ...newUserData, discordId: e.target.value })}
                            placeholder="Enter Discord ID"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newUserData.role}
                            onValueChange={(value: "staff" | "user") => setNewUserData({ ...newUserData, role: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="staff">Staff</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddUser}>Add User</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Information</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hosting:</span>
                    <Badge variant="outline">
                      <Globe className="h-3 w-3 mr-1" />
                      v0 Hosting
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current URL:</span>
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                      {currentUrl.replace("https://", "").substring(0, 20)}...
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bot Status:</span>
                    <Badge variant={botConfig.isRunning ? "default" : "secondary"}>
                      {botConfig.isRunning ? "Online" : "Offline"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Token Set:</span>
                    <Badge variant={botConfig.token ? "default" : "destructive"}>
                      {botConfig.token ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Environment Variables Status */}
            <Card>
              <CardHeader>
                <CardTitle>Configuration Status</CardTitle>
                <CardDescription>Check your environment variables setup</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">DISCORD_CLIENT_ID</span>
                    <Badge variant={process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ? "default" : "destructive"}>
                      {process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ? "Set" : "Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">OWNER_ID</span>
                    <Badge variant={process.env.NEXT_PUBLIC_OWNER_ID ? "default" : "destructive"}>
                      {process.env.NEXT_PUBLIC_OWNER_ID ? "Set" : "Missing"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">REDIRECT_URI</span>
                    <Badge variant="outline">{currentUrl}/auth/callback</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">Bot Token</span>
                    <Badge variant={botConfig.token ? "default" : "destructive"}>
                      {botConfig.token ? "Set" : "Missing"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bot" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bot Configuration</CardTitle>
                  <CardDescription>Configure and control your Discord bot</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Make sure to add <code className="bg-gray-100 px-1 rounded">{currentUrl}/auth/callback</code> as a
                      redirect URI in your Discord application settings.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="bot-token">Bot Token</Label>
                    <div className="relative">
                      <Input
                        id="bot-token"
                        type={showToken ? "text" : "password"}
                        placeholder="Enter your Discord bot token"
                        value={botConfig.token}
                        onChange={(e) => updateBotConfig({ token: e.target.value })}
                        className="pr-20"
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setShowToken(!showToken)}
                        >
                          {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={handleCopyToken}
                          disabled={!botConfig.token}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-name">Bot Name</Label>
                    <Input
                      id="bot-name"
                      value={botConfig.name}
                      onChange={(e) => updateBotConfig({ name: e.target.value })}
                      placeholder="Enter bot name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bot-prefix">Command Prefix</Label>
                    <Input
                      id="bot-prefix"
                      value={botConfig.prefix}
                      onChange={(e) => updateBotConfig({ prefix: e.target.value })}
                      placeholder="Enter command prefix"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-id">Client ID (for invite link)</Label>
                    <Input
                      id="client-id"
                      value={botConfig.clientId || ""}
                      onChange={(e) => updateBotConfig({ clientId: e.target.value })}
                      placeholder="Enter Discord application client ID"
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleStartBot} disabled={botConfig.isRunning || !botConfig.token || botStarting}>
                      {botStarting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {botStarting ? "Starting..." : "Start Bot"}
                    </Button>
                    <Button onClick={stopBot} disabled={!botConfig.isRunning} variant="destructive">
                      <Square className="h-4 w-4 mr-2" />
                      Stop Bot
                    </Button>
                    {botConfig.clientId && (
                      <Button onClick={handleCopyInviteLink} variant="outline">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Copy Invite Link
                      </Button>
                    )}
                  </div>

                  {botConfig.isRunning && (
                    <Alert>
                      <Bot className="h-4 w-4" />
                      <AlertDescription>Bot is currently running and connected to Discord.</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <BotConsole isRunning={botConfig.isRunning} />
            </div>
          </TabsContent>

          {/* Rest of the tabs remain the same... */}
          <TabsContent value="commands" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Bot Commands</CardTitle>
                    <CardDescription>Manage your bot's commands</CardDescription>
                  </div>
                  <Dialog open={isAddCommandOpen} onOpenChange={setIsAddCommandOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Command
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Command</DialogTitle>
                        <DialogDescription>Create a new bot command</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="command-name">Command Name</Label>
                          <Input
                            id="command-name"
                            value={newCommand.name}
                            onChange={(e) => setNewCommand({ ...newCommand, name: e.target.value })}
                            placeholder="e.g., ping"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="command-description">Description</Label>
                          <Input
                            id="command-description"
                            value={newCommand.description}
                            onChange={(e) => setNewCommand({ ...newCommand, description: e.target.value })}
                            placeholder="What does this command do?"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="command-usage">Usage</Label>
                          <Input
                            id="command-usage"
                            value={newCommand.usage}
                            onChange={(e) => setNewCommand({ ...newCommand, usage: e.target.value })}
                            placeholder="e.g., !ping"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="command-category">Category</Label>
                          <Select
                            value={newCommand.category}
                            onValueChange={(value) => setNewCommand({ ...newCommand, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utility">Utility</SelectItem>
                              <SelectItem value="fun">Fun</SelectItem>
                              <SelectItem value="moderation">Moderation</SelectItem>
                              <SelectItem value="music">Music</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="command-enabled"
                            checked={newCommand.enabled}
                            onCheckedChange={(checked) => setNewCommand({ ...newCommand, enabled: checked as boolean })}
                          />
                          <Label htmlFor="command-enabled">Enable command</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddCommand}>Add Command</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {commands.map((command) => (
                    <div key={command.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {botConfig.prefix}
                            {command.name}
                          </h3>
                          <Badge variant="outline">{command.category}</Badge>
                          <Badge variant={command.enabled ? "default" : "secondary"}>
                            {command.enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{command.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">Usage: {command.usage}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={command.enabled}
                          onCheckedChange={(checked) => updateCommand(command.id, { enabled: checked })}
                        />
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => deleteCommand(command.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="servers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Discord Servers</CardTitle>
                <CardDescription>Servers where your bot is present</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guilds.length > 0 ? (
                    guilds.map((guild) => (
                      <div key={guild.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                            {guild.icon ? (
                              <img
                                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                alt={guild.name}
                                className="h-12 w-12 rounded-full"
                              />
                            ) : (
                              <Server className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{guild.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {guild.memberCount} members • ID: {guild.id}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {guild.owner && <Badge variant="default">Owner</Badge>}
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Server className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-muted-foreground">No servers found. Start the bot to see connected servers.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage user access and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users
                    .filter((u) => u.role !== "owner")
                    .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.username}
                            className="h-10 w-10 rounded-full"
                          />
                          <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-muted-foreground">
                              {user.discordId} • {user.permissions.length} permissions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.role === "staff" ? "default" : "secondary"}>{user.role}</Badge>
                          <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => removeUser(user.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit User Permissions</DialogTitle>
                  <DialogDescription>Configure permissions for {selectedUser?.username}</DialogDescription>
                </DialogHeader>
                {selectedUser && (
                  <div className="space-y-6">
                    {Object.entries(groupedPermissions).map(([category, permissions]) => (
                      <div key={category} className="space-y-3">
                        <h3 className="font-medium capitalize">{category} Permissions</h3>
                        <div className="space-y-2">
                          {permissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={selectedUser.permissions.some((p) => p.id === permission.id)}
                                onCheckedChange={(checked) => handleUpdatePermissions(permission, checked as boolean)}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <Label htmlFor={permission.id} className="text-sm font-medium">
                                  {permission.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">{permission.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button onClick={() => setIsEditUserOpen(false)}>Save Changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>v0 Hosting Settings</CardTitle>
                <CardDescription>Configuration specific to v0 hosting environment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    You're running on v0 hosting. Your current URL is: <code>{currentUrl}</code>
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Discord Redirect URI</Label>
                  <div className="flex gap-2">
                    <Input value={`${currentUrl}/auth/callback`} readOnly className="font-mono text-sm" />
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(`${currentUrl}/auth/callback`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add this URL to your Discord application's OAuth2 redirect URIs
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                  <Input id="webhook-url" placeholder="Discord webhook URL for notifications" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Enable Auto Backup</Label>
                  <Switch id="auto-backup" />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch id="maintenance-mode" />
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
