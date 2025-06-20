"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Copy, Check } from "lucide-react"

export default function TokenInput() {
  const [token, setToken] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSave = () => {
    if (token) {
      // Store in localStorage for this session
      localStorage.setItem("discord_bot_token", token)
      alert("Token saved locally!")
    }
  }

  const handleLoad = () => {
    const savedToken = localStorage.getItem("discord_bot_token")
    if (savedToken) {
      setToken(savedToken)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Discord Bot Token</CardTitle>
        <CardDescription>Enter your Discord bot token for configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">Bot Token</Label>
          <div className="relative">
            <Input
              id="token"
              type={showToken ? "text" : "password"}
              placeholder="Enter your Discord bot token..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="pr-20"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
                disabled={!token}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {token && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Token Preview:</p>
            <code className="text-xs break-all">{showToken ? token : token.replace(/./g, "•")}</code>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSave} disabled={!token} className="flex-1">
          Save Token
        </Button>
        <Button onClick={handleLoad} variant="outline" className="flex-1">
          Load Saved
        </Button>
      </CardFooter>
    </Card>
  )
}
