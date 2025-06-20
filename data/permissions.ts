import type { Permission } from "../types/auth"

export const availablePermissions: Permission[] = [
  // Bot Management
  { id: "bot.start", name: "Start Bot", description: "Start the Discord bot", category: "bot" },
  { id: "bot.stop", name: "Stop Bot", description: "Stop the Discord bot", category: "bot" },
  { id: "bot.config", name: "Configure Bot", description: "Change bot settings", category: "bot" },
  { id: "bot.token", name: "Manage Token", description: "View and update bot token", category: "bot" },
  { id: "bot.status", name: "View Status", description: "View bot status and statistics", category: "bot" },

  // User Management
  { id: "users.view", name: "View Users", description: "View all users", category: "users" },
  { id: "users.add", name: "Add Users", description: "Add new users", category: "users" },
  { id: "users.edit", name: "Edit Users", description: "Edit user permissions", category: "users" },
  { id: "users.remove", name: "Remove Users", description: "Remove users", category: "users" },

  // Command Management
  { id: "commands.view", name: "View Commands", description: "View bot commands", category: "commands" },
  { id: "commands.create", name: "Create Commands", description: "Create new commands", category: "commands" },
  { id: "commands.edit", name: "Edit Commands", description: "Edit existing commands", category: "commands" },
  { id: "commands.delete", name: "Delete Commands", description: "Delete commands", category: "commands" },

  // Server Management
  { id: "servers.view", name: "View Servers", description: "View bot servers", category: "servers" },
  { id: "servers.manage", name: "Manage Servers", description: "Manage bot servers", category: "servers" },
  { id: "servers.leave", name: "Leave Servers", description: "Make bot leave servers", category: "servers" },

  // Settings
  { id: "settings.view", name: "View Settings", description: "View system settings", category: "settings" },
  { id: "settings.edit", name: "Edit Settings", description: "Edit system settings", category: "settings" },
]
