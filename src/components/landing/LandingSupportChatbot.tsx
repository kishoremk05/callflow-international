import { useMemo, useState } from "react";
import { FaRobot } from "react-icons/fa";

type ChatMessage = {
  id: string;
  role: "bot" | "user";
  text: string;
};

const fallbackReply = "Let me check that for you";

export default function LandingSupportChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: "Hi. I can help with features, pricing, and support in a few quick steps. What would you like to know?",
    },
  ]);

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:5000",
    [],
  );

  const pushBotReply = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-bot`,
        role: "bot",
        text: text || fallbackReply,
      },
    ]);
  };

  const askSupport = async (message: string) => {
    const response = await fetch(`${apiBase}/api/support-chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) throw new Error("support-chat failed");
    const data = await response.json();
    return data?.reply || fallbackReply;
  };

  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text: question },
    ]);
    setInput("");
    setLoading(true);

    try {
      const reply = await askSupport(question);
      pushBotReply(reply);
    } catch (error) {
      pushBotReply(fallbackReply);
      try {
        const retryReply = await askSupport(question);
        pushBotReply(retryReply);
      } catch {
        pushBotReply(
          "I can still help with product overview, pricing plans, and support options.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[120]">
      {open ? (
        <div className="w-[340px] max-w-[90vw] h-[470px] bg-[#0f1721] border border-lime/25 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-lime/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-lime/15 text-lime">
                <FaRobot className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-lime font-display text-xs tracking-widest uppercase">
                CallFlow Support
              </p>
              <p className="text-zinc-300 text-xs">Fast 24/7 help</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-zinc-400 hover:text-zinc-200 text-sm"
              type="button"
            >
              Close
            </button>
          </div>

          <div
            className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0c131d]"
            data-lenis-prevent
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[88%] text-sm leading-relaxed whitespace-pre-line px-3 py-2 rounded-lg ${
                  message.role === "user"
                    ? "ml-auto bg-lime text-[#121922]"
                    : "bg-[#182433] text-zinc-100"
                }`}
              >
                {message.text}
              </div>
            ))}
            {loading ? (
              <div className="max-w-[88%] text-sm px-3 py-2 rounded-lg bg-[#182433] text-zinc-300">
                Let me check that for you...
              </div>
            ) : null}
          </div>

          <div className="p-3 border-t border-lime/20 bg-[#0f1721]">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
                placeholder="Ask about features, pricing, support..."
                className="flex-1 bg-[#0b1119] border border-lime/20 text-zinc-100 placeholder:text-zinc-500 rounded-md px-3 py-2 text-sm outline-none focus:border-lime/45"
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-3 py-2 text-xs uppercase tracking-wider bg-lime text-[#101722] rounded-md disabled:opacity-50"
                type="button"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-lime text-[#0f1721] font-display text-xs uppercase tracking-widest px-4 py-3 rounded-full shadow-xl hover:opacity-90 inline-flex items-center gap-2"
          type="button"
        >
          <FaRobot className="h-4 w-4" aria-hidden="true" />
          24/7 Support
        </button>
      )}
    </div>
  );
}
