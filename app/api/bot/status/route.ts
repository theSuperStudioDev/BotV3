import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Access the global bot instance
    const botInstance = (global as any).globalBotInstance

    if (botInstance && (botInstance.isReady() || botInstance._isStarting)) {
      return NextResponse.json({
        isRunning: botInstance.isReady() || botInstance._isStarting,
        uptime: botInstance.uptime || 0,
        guilds: botInstance.guilds?.cache?.size || 0,
        users: botInstance.guilds?.cache?.reduce((acc: number, guild: any) => acc + guild.memberCount, 0) || 0,
        ping: botInstance.ws?.ping || 0,
        username: botInstance.user?.username || "Connecting...",
        id: botInstance.user?.id || "pending",
        status: botInstance.isReady() ? "online" : "connecting",
      })
    }

    return NextResponse.json({
      isRunning: false,
      uptime: 0,
      guilds: 0,
      users: 0,
      ping: 0,
      status: "offline",
    })
  } catch (error) {
    console.error("Status check error:", error)
    return NextResponse.json({
      isRunning: false,
      uptime: 0,
      guilds: 0,
      users: 0,
      ping: 0,
      status: "error",
      error: "Failed to get bot status",
    })
  }
}
