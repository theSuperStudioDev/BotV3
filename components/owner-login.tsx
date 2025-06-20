"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Crown, Shield } from "lucide-react"
import { useAuth } from "../contexts/auth-context"

export default function OwnerLogin() {
  const [discordId, setDiscordId] = useState("")
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(discordId)
    if (!success) {
      setError("Access denied. Invalid Discord ID or insufficient permissions.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <Crown className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Owner Panel</CardTitle>
          <CardDescription>Enter your Discord ID to access the owner dashboard</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discordId">Discord ID</Label>
              <Input
                id="discordId"
                type="text"
                placeholder="Enter your Discord ID"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Only authorized Discord IDs can access this panel.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Access Owner Panel
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
