"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Bot, AlertCircle } from "lucide-react"
import { useAuth } from "../contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function DiscordLogin() {
  const { loginWithDiscord } = useAuth()

  // Check if environment variables are set
  const hasDiscordConfig = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Discord Bot Panel
          </CardTitle>
          <CardDescription>Authenticate with Discord to access the bot management dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <Bot className="h-12 w-12 mx-auto text-indigo-500" />
            <p className="text-sm text-muted-foreground">Secure authentication using Discord OAuth2</p>
          </div>

          {!hasDiscordConfig && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Discord OAuth is not configured. Please set up your environment variables in the v0 dashboard.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={loginWithDiscord}
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white"
            size="lg"
            disabled={!hasDiscordConfig}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            Continue with Discord
          </Button>

          <div className="text-xs text-center text-muted-foreground space-y-1">
            <p>Only authorized users can access this panel</p>
            <p>Owner: Discord ID {process.env.NEXT_PUBLIC_OWNER_ID || "994014906359742504"}</p>
            {hasDiscordConfig && <p className="text-green-600">✅ Discord OAuth configured</p>}
          </div>

          {!hasDiscordConfig && (
            <div className="text-xs text-center text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-2">Required Environment Variables:</p>
              <div className="text-left space-y-1">
                <p>• DISCORD_CLIENT_ID</p>
                <p>• DISCORD_CLIENT_SECRET</p>
                <p>• NEXT_PUBLIC_DISCORD_CLIENT_ID</p>
                <p>• NEXT_PUBLIC_OWNER_ID</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
