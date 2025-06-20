export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string | null
  email?: string
  verified?: boolean
}

export interface User {
  id: string
  username: string
  discordId: string
  role: "owner" | "staff" | "user"
  avatar?: string
  permissions: Permission[]
  createdAt: Date
  lastActive: Date
  discordData: DiscordUser
}

export interface Permission {
  id: string
  name: string
  description: string
  category: "bot" | "users" | "commands" | "settings" | "servers"
}

export interface BotConfig {
  token: string
  name: string
  prefix: string
  status: "online" | "offline" | "idle" | "dnd"
  isRunning: boolean
  clientId?: string
  guildCount?: number
  userCount?: number
}

export interface DiscordGuild {
  id: string
  name: string
  icon: string | null
  memberCount: number
  owner: boolean
  permissions: string
}

export interface BotCommand {
  id: string
  name: string
  description: string
  enabled: boolean
  usage: string
  category: string
  permissions: string[]
}

export interface AuthContextType {
  user: User | null
  users: User[]
  botConfig: BotConfig
  guilds: DiscordGuild[]
  commands: BotCommand[]
  loginWithDiscord: () => void
  logout: () => void
  addUser: (userData: Partial<User>) => void
  updateUserPermissions: (userId: string, permissions: Permission[]) => void
  removeUser: (userId: string) => void
  updateBotConfig: (config: Partial<BotConfig>) => void
  startBot: () => Promise<boolean>
  stopBot: () => void
  addCommand: (command: Omit<BotCommand, "id">) => void
  updateCommand: (id: string, command: Partial<BotCommand>) => void
  deleteCommand: (id: string) => void
  isLoading: boolean
}
