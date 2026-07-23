"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"

interface Message {
  id: number
  type: "user" | "ai"
  content: string
}

const initialMessages: Message[] = [
  {
    id: 1,
    type: "ai",
    content:
      "Hi Kavya! I'm your FinSight assistant. Ask me anything about investing, markets, or your portfolio.",
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)

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
