"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, AuthContextType, BotConfig, DiscordGuild, BotCommand } from "../types/auth"
import { availablePermissions } from "../data/permissions"
import { getDiscordAuthUrl, exchangeCodeForToken } from "../lib/discord-oauth"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const OWNER_DISCORD_ID = process.env.NEXT_PUBLIC_OWNER_ID || "994014906359742504"

// Mock initial data
const initialBotConfig: BotConfig = {
  token: "",
  name: "My Discord Bot",
  prefix: "!",
  status: "offline",
  isRunning: false,
  clientId: "",
  guildCount: 0,
  userCount: 0,
}

const initialCommands: BotCommand[] = [
  {
    id: "1",
    name: "ping",
    description: "Check bot latency",
    enabled: true,
    usage: "!ping",
    category: "utility",
    permissions: [],
  },
  {
    id: "2",
    name: "hello",
    description: "Greet the user",
    enabled: true,
    usage: "!hello",
    category: "fun",
    permissions: [],
  },
  {
    id: "3",
    name: "test",
    description: "Test bot functionality",
    enabled: true,
    usage: "!test",
    category: "utility",
    permissions: [],
  },
  {
    id: "4",
    name: "info",
    description: "Show bot information",
    enabled: true,
    usage: "!info",
    category: "utility",
    permissions: [],
  },
  {
    id: "5",
    name: "help",
    description: "Show available commands",
    enabled: true,
    usage: "!help",
    category: "utility",
    permissions: [],
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [botConfig, setBotConfig] = useState<BotConfig>(initialBotConfig)
  const [guilds, setGuilds] = useState<DiscordGuild[]>([])
  const [commands, setCommands] = useState<BotCommand[]>(initialCommands)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load saved data from localStorage
    const savedUser = localStorage.getItem("discord_bot_user")
    const savedUsers = localStorage.getItem("discord_bot_users")
    const savedBotConfig = localStorage.getItem("discord_bot_config")
    const savedCommands = localStorage.getItem("discord_bot_commands")

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
    if (savedBotConfig) {
      setBotConfig(JSON.parse(savedBotConfig))
    }
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands))
    }

    // Check for OAuth callback code in URL
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const error = urlParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      setIsLoading(false)
      return
    }

    if (code) {
      handleDiscordCallback(code)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("discord_bot_user", JSON.stringify(user))
    }
  }, [user])

  useEffect(() => {
    localStorage.setItem("discord_bot_users", JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem("discord_bot_config", JSON.stringify(botConfig))
  }, [botConfig])

  useEffect(() => {
    localStorage.setItem("discord_bot_commands", JSON.stringify(commands))
  }, [commands])

  const handleDiscordCallback = async (code: string) => {
    try {
      setIsLoading(true)
      console.log("Processing Discord OAuth callback...")

      const data = await exchangeCodeForToken(code)
      const discordUser = data.user
      const userGuilds = data.guilds || []

      console.log("Discord user:", discordUser)

      // Check if user is owner or exists in users list
      let userRole: "owner" | "staff" | "user" = "user"
      let userPermissions = []

      if (discordUser.id === OWNER_DISCORD_ID) {
        userRole = "owner"
        userPermissions = availablePermissions
        console.log("Owner detected!")
      } else {
        const existingUser = users.find((u) => u.discordId === discordUser.id)
        if (existingUser) {
          userRole = existingUser.role
          userPermissions = existingUser.permissions
          console.log("Existing user found:", existingUser)
        } else {
          // User not authorized
          console.log("User not authorized:", discordUser.id)
          alert("Access denied. You are not authorized to access this panel.")
          setIsLoading(false)
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }
      }

      const newUser: User = {
        id: discordUser.id,
        username: discordUser.username,
        discordId: discordUser.id,
        role: userRole,
        avatar: discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : "/placeholder.svg?height=40&width=40",
        permissions: userPermissions,
        createdAt: new Date(),
        lastActive: new Date(),
        discordData: discordUser,
      }

      setUser(newUser)
      setGuilds(userGuilds)

      // Update users list if this is a new user
      if (userRole === "owner" && !users.find((u) => u.discordId === discordUser.id)) {
        setUsers([...users, newUser])
      }

      console.log("User authenticated successfully:", newUser)

      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    } catch (error) {
      console.error("Discord OAuth error:", error)
      alert("Authentication failed. Please try again.")
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname)
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithDiscord = () => {
    const authUrl = getDiscordAuthUrl()
    console.log("Redirecting to Discord OAuth:", authUrl)
    window.location.href = authUrl
  }

  const logout = () => {
    setUser(null)
    setGuilds([])
    localStorage.removeItem("discord_bot_user")
  }

  const addUser = (userData: Partial<User>) => {
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username || "New User",
      discordId: userData.discordId || "",
      role: userData.role || "user",
      avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
      permissions: userData.permissions || [],
      createdAt: new Date(),
      lastActive: new Date(),
      discordData: userData.discordData || ({} as any),
    }
    setUsers([...users, newUser])
  }

  const updateUserPermissions = (userId: string, permissions: typeof availablePermissions) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, permissions } : u)))
  }

  const removeUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId))
  }

  const updateBotConfig = (config: Partial<BotConfig>) => {
    setBotConfig({ ...botConfig, ...config })
  }

  const startBot = async (): Promise<boolean> => {
    if (!botConfig.token) {
      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("error", "No bot token provided", "system")
      }
      alert("Please set a bot token first!")
      return false
    }

    try {
      console.log("🚀 Starting bot with robust connection...")

      // Add to bot console
      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("info", "Starting bot with enhanced connection handling...", "system")
        ;(window as any).addBotLog("info", "Validating bot token...", "system")
      }

      const response = await fetch("/api/bot/start-robust", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: botConfig.token,
          config: botConfig,
        }),
      })

      const data = await response.json()
      console.log("Bot start response:", data)

      if (data.success) {
        setBotConfig({
          ...botConfig,
          isRunning: true,
          status: "online",
          guildCount: data.botInfo?.guildCount || 0,
          userCount: data.botInfo?.userCount || 0,
        })

        // Add success logs to console
        if ((window as any).addBotLog && data.logs) {
          data.logs.forEach((log: string) => {
            ;(window as any).addBotLog("success", log, "bot")
          })
        }

        // Enhanced status polling with better error handling
        let pollCount = 0
        const maxPolls = 10

        const pollStatus = () => {
          if (pollCount >= maxPolls) {
            if ((window as any).addBotLog) {
              ;(window as any).addBotLog("warn", "Status polling stopped after maximum attempts", "system")
            }
            return
          }

          pollCount++

          fetch("/api/bot/status")
            .then((res) => res.json())
            .then((status) => {
              if (status.status === "online" && status.username !== "Connecting...") {
                if ((window as any).addBotLog) {
                  ;(window as any).addBotLog("success", `Bot fully ready as ${status.username}`, "bot")
                  ;(window as any).addBotLog(
                    "info",
                    `Connected to ${status.guilds} guilds with ${status.users} users`,
                    "bot",
                  )
                  ;(window as any).addBotLog("info", `WebSocket ping: ${status.ping}ms`, "bot")
                }
                setBotConfig((prev) => ({
                  ...prev,
                  guildCount: status.guilds,
                  userCount: status.users,
                }))
              } else if (pollCount < maxPolls) {
                // Continue polling if still connecting
                setTimeout(pollStatus, 3000)
              }
            })
            .catch((error) => {
              if ((window as any).addBotLog && pollCount < maxPolls) {
                ;(window as any).addBotLog("warn", `Status check failed: ${error.message}`, "system")
              }
              if (pollCount < maxPolls) {
                setTimeout(pollStatus, 5000) // Longer delay on error
              }
            })
        }

        // Start polling after 2 seconds
        setTimeout(pollStatus, 2000)

        console.log("✅ Bot started successfully!")
        return true
      } else {
        console.error("❌ Bot start failed:", data)

        // Add error logs to console
        if ((window as any).addBotLog) {
          ;(window as any).addBotLog("error", data.error || "Failed to start bot", "system")
          if (data.logs) {
            data.logs.forEach((log: string) => {
              ;(window as any).addBotLog("error", log, "system")
            })
          }
        }

        alert(`Failed to start bot: ${data.error || data.details}`)
        return false
      }
    } catch (error: any) {
      console.error("❌ Failed to start bot:", error)

      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("error", `Network error: ${error.message}`, "system")
        ;(window as any).addBotLog("error", "Check your internet connection and try again", "system")
      }

      alert("Failed to start bot. Please check your connection and try again.")
      return false
    }
  }

  const stopBot = async () => {
    try {
      console.log("🛑 Stopping bot...")

      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("info", "Stopping bot...", "system")
      }

      const response = await fetch("/api/bot/stop", {
        method: "POST",
      })

      const data = await response.json()
      console.log("Bot stop response:", data)

      setBotConfig({ ...botConfig, isRunning: false, status: "offline" })

      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("success", "Bot stopped successfully", "system")
      }

      console.log("✅ Bot stopped successfully!")
    } catch (error: any) {
      console.error("❌ Failed to stop bot:", error)

      if ((window as any).addBotLog) {
        ;(window as any).addBotLog("error", `Failed to stop bot: ${error.message}`, "system")
      }
    }
  }

  const addCommand = (command: Omit<BotCommand, "id">) => {
    const newCommand: BotCommand = {
      ...command,
      id: Date.now().toString(),
    }
    setCommands([...commands, newCommand])
  }

  const updateCommand = (id: string, command: Partial<BotCommand>) => {
    setCommands(commands.map((c) => (c.id === id ? { ...c, ...command } : c)))
  }

  const deleteCommand = (id: string) => {
    setCommands(commands.filter((c) => c.id !== id))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        botConfig,
        guilds,
        commands,
        loginWithDiscord,
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
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
