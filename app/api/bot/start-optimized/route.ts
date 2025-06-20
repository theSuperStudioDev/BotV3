import { type NextRequest, NextResponse } from "next/server"

// Global bot instance storage
let globalBotInstance: any = null

export async function POST(request: NextRequest) {
  try {
    const { token, config } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Bot token is required" }, { status: 400 })
    }

    console.log("🔄 Starting bot with config:", { name: config.name, prefix: config.prefix })

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

    // Dynamic import to avoid build issues
    const { Client, GatewayIntentBits, ActivityType, Events, Partials } = await import("discord.js")

    console.log("📦 Discord.js imported successfully")

    // Create new bot instance with minimal intents for faster connection
    globalBotInstance = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
      partials: [Partials.Channel],
    })

    // Set up essential event handlers first
    globalBotInstance.once(Events.Ready, () => {
      console.log(`✅ Bot logged in as ${globalBotInstance.user?.tag}`)
      console.log(`📊 Connected to ${globalBotInstance.guilds.cache.size} guilds`)

      // Set bot activity
      globalBotInstance.user?.setActivity(config.name || "Bot Management Panel", {
        type: ActivityType.Watching,
      })

      globalBotInstance._isReady = true
    })

    // Add error handler immediately
    globalBotInstance.on(Events.Error, (error: Error) => {
      console.error("❌ Bot error:", error.message)
    })

    // Quick login attempt with shorter timeout
    console.log("🔐 Attempting to login to Discord...")

    const loginPromise = globalBotInstance.login(token)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Login timeout after 8 seconds")), 8000)
    })

    try {
      await Promise.race([loginPromise, timeoutPromise])
      console.log("🔑 Login successful!")

      // Mark as starting
      globalBotInstance._isStarting = true

      // Return immediate success to prevent API timeout
      const response = {
        success: true,
        message: "Bot connection initiated successfully",
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
          "Bot is initializing...",
          "Ready event pending...",
        ],
      }

      // Continue setup in background
      setImmediate(() => {
        setupBotHandlers(globalBotInstance, config)
      })

      return NextResponse.json(response)
    } catch (error: any) {
      console.error("❌ Login failed:", error)

      // Clean up on login failure
      if (globalBotInstance) {
        try {
          await globalBotInstance.destroy()
        } catch (e) {
          console.log("Error cleanup:", e)
        }
        globalBotInstance = null
      }

      let errorMessage = "Failed to connect to Discord"
      if (error.code === "TOKEN_INVALID") {
        errorMessage = "Invalid bot token. Please check your token and try again."
      } else if (error.code === "DISALLOWED_INTENTS") {
        errorMessage =
          "Bot is missing required intents. Please enable Message Content Intent in Discord Developer Portal."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Connection timed out. Please check your internet connection and try again."
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: error.message,
          code: error.code,
          logs: [
            `Error: ${errorMessage}`,
            `Details: ${error.message}`,
            error.code ? `Code: ${error.code}` : null,
          ].filter(Boolean),
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json(
      {
        error: "Unexpected server error",
        details: error.message,
        logs: [`Unexpected error: ${error.message}`],
      },
      { status: 500 },
    )
  }
}

function setupBotHandlers(bot: any, config: any) {
  console.log("🔧 Setting up bot handlers...")

  // Wait for ready with longer timeout since we're in background
  const readyTimeout = setTimeout(() => {
    console.log("⚠️ Ready event timeout, but bot may still be functional")
    bot._isStarting = false
  }, 15000)

  bot.once(Events.Ready, () => {
    clearTimeout(readyTimeout)
    bot._isStarting = false
    console.log("🎉 Bot is fully ready and operational!")
  })

  // Message handler
  bot.on(Events.MessageCreate, async (message: any) => {
    if (message.author.bot) return

    const prefix = config.prefix || "!"
    if (!message.content.startsWith(prefix)) return

    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const command = args.shift()?.toLowerCase()

    console.log(`📝 Command received: ${command} from ${message.author.tag}`)

    try {
      switch (command) {
        case "ping":
          const ping = bot.ws.ping
          await message.reply(`🏓 Pong! Latency: ${ping}ms`)
          console.log(`✅ Ping command executed - ${ping}ms`)
          break

        case "hello":
          await message.reply(`👋 Hello ${message.author.username}! I'm online and ready!`)
          console.log(`✅ Hello command executed for ${message.author.username}`)
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
            ],
            timestamp: new Date().toISOString(),
          }
          await message.reply({ embeds: [embed] })
          console.log(`✅ Info command executed`)
          break

        case "help":
          const helpEmbed = {
            color: 0x00ff00,
            title: "📚 Available Commands",
            description: `Commands with prefix \`${prefix}\`:`,
            fields: [
              { name: `${prefix}ping`, value: "Check bot latency", inline: false },
              { name: `${prefix}hello`, value: "Get a greeting", inline: false },
              { name: `${prefix}info`, value: "Show bot information", inline: false },
              { name: `${prefix}help`, value: "Show this help", inline: false },
            ],
          }
          await message.reply({ embeds: [helpEmbed] })
          console.log(`✅ Help command executed`)
          break

        default:
          await message.reply(`❓ Unknown command: \`${command}\`. Use \`${prefix}help\` for available commands.`)
      }
    } catch (cmdError) {
      console.error("❌ Command execution error:", cmdError)
      await message.reply("❌ An error occurred while executing that command.")
    }
  })

  // Additional event handlers
  bot.on(Events.GuildCreate, (guild: any) => {
    console.log(`📥 Bot joined guild: ${guild.name} (${guild.memberCount} members)`)
  })

  bot.on(Events.GuildDelete, (guild: any) => {
    console.log(`📤 Bot left guild: ${guild.name}`)
  })

  bot.on(Events.Warn, (warning: string) => {
    console.warn("⚠️ Bot warning:", warning)
  })

  bot.on(Events.Disconnect, () => {
    console.log("🔌 Bot disconnected")
  })

  bot.on(Events.Reconnecting, () => {
    console.log("🔄 Bot reconnecting...")
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
