import { type NextRequest, NextResponse } from "next/server"

// Global bot instance storage
let globalBotInstance: any = null

export async function POST(request: NextRequest) {
  try {
    const { token, config } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Bot token is required" }, { status: 400 })
    }

    console.log("🔄 Starting bot with robust connection...")

    // Stop existing bot if running
    if (globalBotInstance) {
      try {
        console.log("🛑 Stopping existing bot instance...")
        await globalBotInstance.destroy()
      } catch (e) {
        console.log("Previous bot cleanup:", e)
      }
      globalBotInstance = null
    }

    // Validate token format first
    if (!token.match(/^[A-Za-z0-9._-]+$/)) {
      return NextResponse.json(
        {
          error: "Invalid token format",
          details: "Bot token contains invalid characters",
          logs: ["Error: Invalid token format", "Please check your bot token"],
        },
        { status: 400 },
      )
    }

    try {
      // Dynamic import with error handling
      const { Client, GatewayIntentBits, ActivityType, Events, Partials } = await import("discord.js")
      console.log("📦 Discord.js imported successfully")

      // Create bot instance with minimal configuration
      globalBotInstance = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
        partials: [Partials.Channel],
        // Add connection options for better reliability
        ws: {
          compress: false,
          properties: {
            browser: "Discord Bot Panel",
          },
        },
      })

      // Set up immediate error handling
      globalBotInstance.on(Events.Error, (error: Error) => {
        console.error("❌ Bot error:", error.message)
      })

      globalBotInstance.on(Events.Debug, (info: string) => {
        if (info.includes("Heartbeat")) return // Skip heartbeat spam
        console.log("🔍 Debug:", info)
      })

      // Set ready flag
      let isReady = false
      globalBotInstance.once(Events.Ready, () => {
        isReady = true
        console.log(`✅ Bot logged in as ${globalBotInstance.user?.tag}`)
        console.log(`📊 Connected to ${globalBotInstance.guilds.cache.size} guilds`)

        // Set bot activity
        globalBotInstance.user?.setActivity(config.name || "Bot Management Panel", {
          type: ActivityType.Watching,
        })
      })

      // Try multiple connection attempts with different strategies
      console.log("🔐 Attempting bot login...")

      const loginAttempts = [
        // Attempt 1: Quick login (5 seconds)
        () => {
          console.log("📡 Attempt 1: Quick connection...")
          return Promise.race([
            globalBotInstance.login(token),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Quick timeout")), 5000)),
          ])
        },
        // Attempt 2: Standard login (10 seconds)
        () => {
          console.log("📡 Attempt 2: Standard connection...")
          return Promise.race([
            globalBotInstance.login(token),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Standard timeout")), 10000)),
          ])
        },
        // Attempt 3: Extended login (15 seconds)
        () => {
          console.log("📡 Attempt 3: Extended connection...")
          return Promise.race([
            globalBotInstance.login(token),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Extended timeout")), 15000)),
          ])
        },
      ]

      let loginSuccess = false
      let lastError = null

      for (let i = 0; i < loginAttempts.length && !loginSuccess; i++) {
        try {
          await loginAttempts[i]()
          loginSuccess = true
          console.log(`✅ Login successful on attempt ${i + 1}`)
        } catch (error: any) {
          lastError = error
          console.log(`❌ Attempt ${i + 1} failed:`, error.message)

          // Recreate client for next attempt if not the last one
          if (i < loginAttempts.length - 1) {
            try {
              await globalBotInstance.destroy()
            } catch (e) {
              // Ignore cleanup errors
            }

            globalBotInstance = new Client({
              intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
              partials: [Partials.Channel],
              ws: {
                compress: false,
                properties: {
                  browser: "Discord Bot Panel",
                },
              },
            })

            globalBotInstance.on(Events.Error, (error: Error) => {
              console.error("❌ Bot error:", error.message)
            })

            globalBotInstance.once(Events.Ready, () => {
              isReady = true
              console.log(`✅ Bot logged in as ${globalBotInstance.user?.tag}`)
              console.log(`📊 Connected to ${globalBotInstance.guilds.cache.size} guilds`)

              globalBotInstance.user?.setActivity(config.name || "Bot Management Panel", {
                type: ActivityType.Watching,
              })
            })
          }
        }
      }

      if (!loginSuccess) {
        throw lastError || new Error("All login attempts failed")
      }

      // Return success immediately after login
      const response = {
        success: true,
        message: "Bot connection established successfully",
        botInfo: {
          username: "Connecting...",
          id: "pending",
          guildCount: 0,
          userCount: 0,
          ping: 0,
        },
        logs: [
          "Bot token validated successfully",
          "Discord WebSocket connection established",
          "Bot login completed",
          "Initializing bot features...",
        ],
      }

      // Set up bot handlers in background
      setImmediate(() => {
        setupBotHandlers(globalBotInstance, config)
      })

      return NextResponse.json(response)
    } catch (importError: any) {
      console.error("❌ Failed to import discord.js:", importError)
      return NextResponse.json(
        {
          error: "Failed to initialize Discord client",
          details: importError.message,
          logs: ["Error: Failed to load Discord.js library", `Details: ${importError.message}`],
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Bot startup failed:", error)

    // Clean up on error
    if (globalBotInstance) {
      try {
        await globalBotInstance.destroy()
      } catch (e) {
        console.log("Error cleanup:", e)
      }
      globalBotInstance = null
    }

    // Provide specific error messages
    let errorMessage = "Failed to start bot"
    let logs = [`Error: ${error.message}`]

    if (error.code === "TOKEN_INVALID") {
      errorMessage = "Invalid bot token"
      logs = [
        "Error: Invalid bot token",
        "Please check your token in Discord Developer Portal",
        "Make sure you copied the full token correctly",
      ]
    } else if (error.code === "DISALLOWED_INTENTS") {
      errorMessage = "Missing required intents"
      logs = [
        "Error: Bot is missing required intents",
        "Please enable Message Content Intent in Discord Developer Portal",
        "Go to Bot settings and enable Privileged Gateway Intents",
      ]
    } else if (error.message.includes("timeout") || error.message.includes("ENOTFOUND")) {
      errorMessage = "Connection timeout"
      logs = [
        "Error: Connection to Discord failed",
        "This may be due to network restrictions in the hosting environment",
        "Try again in a few moments",
        "Consider using a different hosting platform if issues persist",
      ]
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code,
        logs,
      },
      { status: 500 },
    )
  }
}

function setupBotHandlers(bot: any, config: any) {
  console.log("🔧 Setting up bot handlers...")

  // Wait for ready with extended timeout
  const readyTimeout = setTimeout(() => {
    console.log("⚠️ Ready event timeout, but bot may still be functional")
    bot._isStarting = false
  }, 20000)

  bot.once(Events.Ready, () => {
    clearTimeout(readyTimeout)
    bot._isStarting = false
    console.log("🎉 Bot is fully ready and operational!")
  })

  // Enhanced message handler
  bot.on(Events.MessageCreate, async (message: any) => {
    if (message.author.bot) return

    const prefix = config.prefix || "!"
    if (!message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()

    console.log(`📝 Command: ${command} from ${message.author.tag} in ${message.guild?.name || "DM"}`)

    try {
      switch (command) {
        case "ping":
          const ping = bot.ws.ping
          await message.reply(`🏓 Pong! Latency: ${ping}ms`)
          break

        case "hello":
          await message.reply(`👋 Hello ${message.author.username}! I'm online and ready!`)
          break

        case "test":
          await message.reply("✅ Bot is working correctly!")
          break

        case "info":
          const embed = {
            color: 0x0099ff,
            title: "🤖 Bot Information",
            fields: [
              { name: "Bot Name", value: bot.user?.username || "Unknown", inline: true },
              { name: "Servers", value: bot.guilds.cache.size.toString(), inline: true },
              { name: "Uptime", value: formatUptime(bot.uptime || 0), inline: true },
              { name: "Ping", value: `${bot.ws.ping}ms`, inline: true },
              { name: "Prefix", value: prefix, inline: true },
              { name: "Status", value: "🟢 Online", inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: "Bot Management Panel" },
          }
          await message.reply({ embeds: [embed] })
          break

        case "help":
          const helpEmbed = {
            color: 0x00ff00,
            title: "📚 Available Commands",
            description: `Commands with prefix \`${prefix}\`:`,
            fields: [
              { name: `${prefix}ping`, value: "Check bot latency", inline: true },
              { name: `${prefix}hello`, value: "Get a greeting", inline: true },
              { name: `${prefix}test`, value: "Test bot functionality", inline: true },
              { name: `${prefix}info`, value: "Show bot information", inline: true },
              { name: `${prefix}help`, value: "Show this help", inline: true },
            ],
            footer: { text: "Bot Management Panel" },
          }
          await message.reply({ embeds: [helpEmbed] })
          break

        default:
          await message.reply(`❓ Unknown command: \`${command}\`. Use \`${prefix}help\` for available commands.`)
      }
    } catch (cmdError) {
      console.error("❌ Command execution error:", cmdError)
      try {
        await message.reply("❌ An error occurred while executing that command.")
      } catch (replyError) {
        console.error("❌ Failed to send error message:", replyError)
      }
    }
  })

  // Additional event handlers
  bot.on(Events.GuildCreate, (guild: any) => {
    console.log(`📥 Joined guild: ${guild.name} (${guild.memberCount} members)`)
  })

  bot.on(Events.GuildDelete, (guild: any) => {
    console.log(`📤 Left guild: ${guild.name}`)
  })

  bot.on(Events.Warn, (warning: string) => {
    console.warn("⚠️ Warning:", warning)
  })

  bot.on(Events.Disconnect, () => {
    console.log("🔌 Disconnected from Discord")
  })

  bot.on(Events.Reconnecting, () => {
    console.log("🔄 Reconnecting to Discord...")
  })

  bot.on(Events.Resume, () => {
    console.log("🔄 Resumed connection to Discord")
  })
}

function formatUptime(uptime: number): string {
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
