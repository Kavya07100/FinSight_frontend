import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ChatMessageProps {
  type: "user" | "ai"
  content: string
}

export function ChatMessage({ type, content }: ChatMessageProps) {
  const isUser = type === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        {isUser ? (
          <>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya" />
            <AvatarFallback>K</AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="https://api.dicebear.com/7.x/shapes/svg?seed=FinSight" />
            <AvatarFallback>FS</AvatarFallback>
          </>
        )}
      </Avatar>
      <div
        className={`max-w-xs rounded-lg px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-accent text-card-foreground"
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
