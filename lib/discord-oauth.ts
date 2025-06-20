const DISCORD_CLIENT_ID = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID
const DISCORD_REDIRECT_URI = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI

export const getDiscordAuthUrl = () => {
  if (!DISCORD_CLIENT_ID) {
    throw new Error("DISCORD_CLIENT_ID environment variable is not set")
  }

  // For v0 hosting, use the current origin + /auth/callback
  const redirectUri = DISCORD_REDIRECT_URI || `${window.location.origin}/auth/callback`

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email guilds",
  })

  console.log("Discord OAuth URL:", `https://discord.com/api/oauth2/authorize?${params.toString()}`)
  console.log("Redirect URI:", redirectUri)

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`
}

export const exchangeCodeForToken = async (code: string) => {
  const response = await fetch("/api/auth/discord", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || "Failed to exchange code for token")
  }

  return response.json()
}
