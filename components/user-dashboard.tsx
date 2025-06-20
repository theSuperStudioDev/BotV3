"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, LogOut, Bot, Send, User, Clock } from "lucide-react"
import { useAuth } from "../contexts/auth-context"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

export default function UserDashboard() {
  const { user, logout } = useAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your Discord bot. How can I help you today?",
      sender: "bot",
      timestamp: new Date(Date.now() - 60000),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")

  const sendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message: "${inputMessage}". This is a demo response!`,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const availableCommands = [
    { name: "/hello", description: "Get a greeting from the bot" },
    { name: "/help", description: "Show available commands" },
    { name: "/info", description: "Get bot information" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold">Discord Bot</h1>
              <p className="text-sm text-gray-500">Welcome, {user?.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="default">Online</Badge>
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat with Bot
                </CardTitle>
                <CardDescription>Send messages and interact with the Discord bot</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {message.sender === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                          <span className="text-xs opacity-70">{message.sender === "bot" ? "Bot" : "You"}</span>
                          <span className="text-xs opacity-70 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Commands</CardTitle>
                <CardDescription>Commands you can use with the bot</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {availableCommands.map((command, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <h3 className="font-medium text-sm">{command.name}</h3>
                    <p className="text-xs text-muted-foreground">{command.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setInputMessage("/hello")}>
                  Say Hello
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setInputMessage("/help")}>
                  Get Help
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setInputMessage("/info")}>
                  Bot Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
