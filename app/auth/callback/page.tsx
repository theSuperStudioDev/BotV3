"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get("code")
    const error = searchParams.get("error")

    if (error) {
      console.error("OAuth error:", error)
      router.push("/?error=oauth_failed")
      return
    }

    if (code) {
      // The auth context will handle this code when we redirect back
      router.push(`/?code=${code}`)
    } else {
      router.push("/")
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
        <h2 className="text-xl font-semibold mb-2">Processing Authentication</h2>
        <p className="text-gray-600">Please wait while we complete your Discord login...</p>
      </div>
    </div>
  )
}
