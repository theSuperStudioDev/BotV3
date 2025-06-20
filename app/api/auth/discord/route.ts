import { type NextRequest, NextResponse } from "next/server"

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      console.error("Missing Discord credentials")
      return NextResponse.json({ error: "Discord credentials not configured" }, { status: 500 })
    }

    // Get the redirect URI from the request origin
    const origin = request.headers.get("origin") || "http://localhost:3000"
    const redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || `${origin}/auth/callback`

    console.log("Token exchange - Redirect URI:", redirectUri)
    console.log("Token exchange - Code:", code.substring(0, 10) + "...")

    // Exchange code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      console.error("Discord token error:", tokenData)
      return NextResponse.json({ error: "Failed to get access token", details: tokenData }, { status: 400 })
    }

    console.log("Token obtained successfully")

    // Get user data
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      console.error("Discord user error:", userData)
      return NextResponse.json({ error: "Failed to get user data", details: userData }, { status: 400 })
    }

    console.log("User data obtained:", userData.username)

    // Get user guilds
    const guildsResponse = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const guildsData = await guildsResponse.json()

    if (!guildsResponse.ok) {
      console.log("Failed to get guilds (non-critical):", guildsData)
    }

    return NextResponse.json({
      user: userData,
      guilds: guildsResponse.ok ? guildsData : [],
      access_token: tokenData.access_token,
    })
  } catch (error) {
    console.error("Discord OAuth error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
