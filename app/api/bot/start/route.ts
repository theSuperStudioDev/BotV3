import { type NextRequest, NextResponse } from "next/server"

// Global bot instance storage (in production, use Redis or database)
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

    // Create new bot instance with proper intents
    globalBotInstance = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel],
    })

    // Set up event handlers
    globalBotInstance.once(Events.Ready, () => {
      console.log(`✅ Bot logged in as ${globalBotInstance.user?.tag}`)
      console.log(`📊 Connected to ${globalBotInstance.guilds.cache.size} guilds`)

      // Set bot activity
      globalBotInstance.user?.setActivity(config.name || "Bot Management Panel", {
        type: ActivityType.Watching,
      })
    })

    globalBotInstance.on(Events.MessageCreate, async (message: any) => {
      if (message.author.bot) return

      const prefix = config.prefix || "!"
      if (!message.content.startsWith(prefix)) return

      const args = message.content.slice(prefix.length).trim().split(/ +/)
      const command = args.shift()?.toLowerCase()

      console.log(`📝 Command received: ${command} from ${message.author.tag} in ${message.guild?.name || "DM"}`)

      try {
        // Handle commands
        switch (command) {
          case "ping":
            const ping = globalBotInstance.ws.ping
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
                { name: "Bot Name", value: globalBotInstance.user?.username || "Unknown", inline: true },
                { name: "Servers", value: globalBotInstance.guilds.cache.size.toString(), inline: true },
                {
                  name: "Users",
                  value: globalBotInstance.guilds.cache
                    .reduce((acc: number, guild: any) => acc + guild.memberCount, 0)
                    .toString(),
                  inline: true,
                },
                { name: "Uptime", value: formatUptime(globalBotInstance.uptime || 0), inline: true },
                { name: "Ping", value: `${globalBotInstance.ws.ping}ms`, inline: true },
                { name: "Prefix", value: prefix, inline: true },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: "Powered by Bot Management Panel",
              },
            }
            await message.reply({ embeds: [embed] })
            console.log(`✅ Info command executed for ${message.author.username}`)
            break

          case "help":
            const helpEmbed = {
              color: 0x00ff00,
              title: "📚 Available Commands",
              description: `Here are the commands you can use with prefix \`${prefix}\`:`,
              fields: [
                { name: `${prefix}ping`, value: "Check bot latency", inline: false },
                { name: `${prefix}hello`, value: "Get a greeting from the bot", inline: false },
                { name: `${prefix}info`, value: "Show detailed bot information", inline: false },
                { name: `${prefix}help`, value: "Show this help message", inline: false },
                { name: `${prefix}status`, value: "Show bot status", inline: false },
              ],
              footer: {
                text: "Bot Management Panel",
              },
            }
            await message.reply({ embeds: [helpEmbed] })
            console.log(`✅ Help command executed for ${message.author.username}`)
            break

          case "status":
            const statusEmbed = {
              color: 0x00ff99,
              title: "📊 Bot Status",
              fields: [
                { name: "Status", value: "🟢 Online", inline: true },
                { name: "Uptime", value: formatUptime(globalBotInstance.uptime || 0), inline: true },
                {
                  name: "Memory Usage",
                  value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                  inline: true,
                },
                { name: "Guilds", value: globalBotInstance.guilds.cache.size.toString(), inline: true },
                { name: "Ping", value: `${globalBotInstance.ws.ping}ms`, inline: true },
              ],
              timestamp: new Date().toISOString(),
            }
            await message.reply({ embeds: [statusEmbed] })
            console.log(`✅ Status command executed for ${message.author.username}`)
            break

          default:
            await message.reply(`❓ Unknown command: \`${command}\`. Use \`${prefix}help\` to see available commands.`)
            console.log(`❓ Unknown command attempted: ${command} by ${message.author.username}`)
        }
      } catch (cmdError) {
        console.error("❌ Command execution error:", cmdError)
        await message.reply("❌ An error occurred while executing that command.")
      }
    })

    // Enhanced event logging
    globalBotInstance.on(Events.Error, (error: Error) => {
      console.error("❌ Bot error:", error.message)
    })

    globalBotInstance.on(Events.Warn, (warning: string) => {
      console.warn("⚠️ Bot warning:", warning)
    })

    globalBotInstance.on(Events.Disconnect, () => {
      console.log("🔌 Bot disconnected from Discord")
    })

    globalBotInstance.on(Events.Reconnecting, () => {
      console.log("🔄 Bot reconnecting to Discord...")
    })

    globalBotInstance.on(Events.GuildCreate, (guild: any) => {
      console.log(`📥 Bot joined guild: ${guild.name} (${guild.memberCount} members)`)
    })

    globalBotInstance.on(Events.GuildDelete, (guild: any) => {
      console.log(`📤 Bot left guild: ${guild.name}`)
    })

    // Login to Discord with timeout
    console.log("🔐 Attempting to login to Discord...")

    const loginPromise = globalBotInstance.login(token)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Login timeout after 10 seconds")), 10000)
    })

    await Promise.race([loginPromise, timeoutPromise])
    console.log("🔑 Login successful!")

    // Return early success response to prevent timeout
    const quickResponse = {
      success: true,
      message: "Bot login initiated successfully",
      botInfo: {
        username: "Connecting...",
        id: "pending",
        guildCount: 0,
        userCount: 0,
        ping: 0,
      },
      logs: ["Bot token validated", "Discord connection established", "Waiting for ready event..."],
    }

    // Set a flag to indicate bot is starting
    globalBotInstance._isStarting = true

    // Continue setup in background
    setImmediate(async () => {
      try {
        const readyPromise = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Bot ready timeout after 5 seconds"))
          }, 5000)

          globalBotInstance.once(Events.Ready, () => {
            clearTimeout(timeout)
            resolve(true)
          })

          globalBotInstance.once(Events.Error, (error: Error) => {
            clearTimeout(timeout)
            reject(error)
          })
        })
        await readyPromise
        globalBotInstance._isStarting = false
        console.log("✅ Bot fully ready!")
      } catch (error) {
        console.error("Ready timeout, but bot may still connect:", error)
        globalBotInstance._isStarting = false
      }
    })

    return NextResponse.json(quickResponse)
  } catch (error: any) {
    console.error("❌ Failed to start bot:", error)

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
    if (error.code === "TOKEN_INVALID") {
      errorMessage = "Invalid bot token. Please check your token and try again."
    } else if (error.code === "DISALLOWED_INTENTS") {
      errorMessage =
        "Bot is missing required intents. Please enable Message Content Intent in Discord Developer Portal."
    } else if (error.message.includes("timeout")) {
      errorMessage = "Bot login timed out. Please check your internet connection and try again."
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.message,
        code: error.code,
        logs: [`Error: ${errorMessage}`, `Details: ${error.message}`, error.code ? `Code: ${error.code}` : null].filter(
          Boolean,
        ),
      },
      { status: 500 },
    )
  }
}

function formatUptime(uptime: number): string {
  const seconds = Math.floor(uptime / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`
  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
