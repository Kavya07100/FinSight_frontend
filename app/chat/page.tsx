import { Sidebar } from "@/components/dashboard/sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChatInput } from "@/components/chat/chat-input"
import { chatMessages } from "@/components/chat/messages"

export default function ChatPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeLink="Chat" />
      <main className="flex-1 overflow-x-hidden px-6 py-8 lg:px-10">
        <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col gap-6">
          <ChatHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {chatMessages.map((msg) => (
                <ChatMessage key={msg.id} type={msg.type} content={msg.content} />
              ))}
            </div>
          </div>
          <ChatInput />
        </div>
      </main>
    </div>
  )
}
