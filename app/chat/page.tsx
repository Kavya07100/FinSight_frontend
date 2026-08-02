"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
}

function greetingMessage(name: string): Message {
  return {
    id: 1,
    type: "ai",
    content: `Hi ${name}! I'm your FinSight assistant. Ask me anything about investing, markets, or your portfolio.`,
  }
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([greetingMessage("there")])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("finsight_user_id")
    if (!userId) return

    const loadUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`)
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
        const user = await res.json()
        const firstName = user.full_name ? user.full_name.split(" ")[0] : "there"
        setMessages([greetingMessage(firstName)])
      } catch {
        setMessages([greetingMessage("there")])
      }
    }

    loadUser()
  }, [])

  const handleSend = async (question: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), type: "user", content: question },
    ])
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/learning/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      })

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`)
      }

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, type: "ai", content: data.answer },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          type: "ai",
          content:
            "Sorry, I couldn't reach the server right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col gap-6">
          <ChatHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} type={msg.type} content={msg.content} />
              ))}
              {isLoading && <ChatMessage type="ai" content="Thinking…" />}
            </div>
          </div>
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </main>
    </div>
  )
}
