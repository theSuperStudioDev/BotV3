import { type NextRequest, NextResponse } from "next/server"

// Reference to the global bot instance
declare global {
  var globalBotInstance: any
}

export async function POST(request: NextRequest) {
  try {
    // Access the global bot instance
    const botInstance = (global as any).globalBotInstance

    if (botInstance) {
      console.log("🔄 Stopping bot...")

      try {
        await botInstance.destroy()
        console.log("✅ Bot stopped successfully")
      } catch (error) {
        console.error("Error stopping bot:", error)
      }
      ;(global as any).globalBotInstance = null

      return NextResponse.json({
        success: true,
        message: "Bot stopped successfully",
      })
    }

    return NextResponse.json({
      success: false,
      message: "Bot is not running",
    })
  } catch (error: any) {
    console.error("❌ Failed to stop bot:", error)
    return NextResponse.json({ error: "Failed to stop bot", details: error.message }, { status: 500 })
  }
}
