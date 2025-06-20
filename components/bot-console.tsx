"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Terminal, Trash2, Download, Copy, Check, AlertTriangle, Wifi, WifiOff } from "lucide-react"

interface LogEntry {
  id: string
  timestamp: Date
  level: "info" | "warn" | "error" | "success" | "debug"
  message: string
  source?: string
}

interface BotConsoleProps {
  isRunning: boolean
}

export default function BotConsole({ isRunning }: BotConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline" | "connecting">("offline")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add initial log
    addLog("info", "Console initialized - Enhanced connection handling enabled", "system")

    // Monitor connection status
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus("online")
      } else {
        setConnectionStatus("offline")
        addLog("warn", "Internet connection lost", "system")
      }
    }

    window.addEventListener("online", checkConnection)
    window.addEventListener("offline", checkConnection)
    checkConnection()

    return () => {
      window.removeEventListener("online", checkConnection)
      window.removeEventListener("offline", checkConnection)
    }
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new logs are added
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [logs])

  const addLog = (level: LogEntry["level"], message: string, source = "system") => {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      level,
      message,
      source,
    }
    setLogs((prev) => [...prev, newLog].slice(-100)) // Keep only last 100 logs
  }

  // Expose addLog function globally for other components to use
  useEffect(() => {
    ;(window as any).addBotLog = addLog
    return () => {
      delete (window as any).addBotLog
    }
  }, [])

  const clearLogs = () => {
    setLogs([])
    addLog("info", "Console cleared", "system")
  }

  const exportLogs = () => {
    const logText = logs
      .map((log) => `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.source}] ${log.message}`)
      .join("\n")

    const blob = new Blob([logText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bot-logs-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    addLog("info", "Logs exported successfully", "system")
  }

  const copyLogs = async () => {
    const logText = logs
      .map((log) => `[${log.timestamp.toLocaleTimeString()}] [${log.level.toUpperCase()}] ${log.message}`)
      .join("\n")

    await navigator.clipboard.writeText(logText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addLog("info", "Logs copied to clipboard", "system")
  }

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-500"
      case "warn":
        return "text-yellow-500"
      case "success":
        return "text-green-500"
      case "debug":
        return "text-blue-500"
      default:
        return "text-gray-300"
    }
  }

  const getLevelBadge = (level: LogEntry["level"]) => {
    const variants = {
      error: "destructive",
      warn: "secondary",
      success: "default",
      debug: "outline",
      info: "outline",
    } as const

    return variants[level] || "outline"
  }

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case "online":
        return <Wifi className="h-4 w-4 text-green-500" />
      case "offline":
        return <WifiOff className="h-4 w-4 text-red-500" />
      default:
        return <Wifi className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="space-y-4">
      {connectionStatus === "offline" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No internet connection detected. Bot startup may fail until connection is restored.
          </AlertDescription>
        </Alert>
      )}

      <Card className="h-[500px] flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <CardTitle className="text-lg">Bot Console</CardTitle>
              <Badge variant={isRunning ? "default" : "secondary"}>{isRunning ? "Active" : "Inactive"}</Badge>
              {getConnectionIcon()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLogs} disabled={logs.length === 0}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={exportLogs} disabled={logs.length === 0}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={clearLogs}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            Enhanced bot logs with connection monitoring ({logs.length}/100) • Connection:{" "}
            {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full px-6 pb-6" ref={scrollAreaRef}>
            <div className="space-y-1 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Terminal className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No logs yet. Start the bot to see activity.</p>
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 py-1 hover:bg-muted/50 px-2 rounded">
                    <span className="text-xs text-muted-foreground min-w-[60px]">
                      {log.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge variant={getLevelBadge(log.level)} className="text-xs min-w-[60px] justify-center">
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground min-w-[50px]">[{log.source}]</span>
                    <span className={`flex-1 ${getLevelColor(log.level)}`}>{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
