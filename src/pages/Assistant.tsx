import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "react-router-dom"; // <--- New Import
import { 
  Send, Bot, User, Sparkles, ChefHat, RotateCcw, AlertTriangle 
} from "lucide-react";

// --- Types ---
type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isError?: boolean;
};

const SUGGESTIONS = [
  "What can I cook with my pantry?",
  "Give me a high-protein breakfast idea.",
  "I have too many tomatoes. Recipe ideas?",
  "Explain the health benefits of turmeric."
];

export default function Assistant() {
  const location = useLocation(); // <--- Hook to read data from Recipes page
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "Hello! I'm your AI Chef. I can help you find recipes based on what you have in your pantry, or answer any nutrition questions. What are we cooking today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRunRef = useRef(false); // Prevent double-firing on strict mode

  // --- Auto-Start Logic ---
  useEffect(() => {
    if (hasRunRef.current) return; // Run only once
    
    // Check if we were redirected here with a recipe
    if (location.state?.startCooking) {
      const recipeName = location.state.startCooking;
      const prompt = `I want to cook ${recipeName}. Please guide me through the steps and give me some pro tips.`;
      
      // Auto-trigger the send function
      handleSend(prompt);
      hasRunRef.current = true;
      
      // Clear state so it doesn't run again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // --- Auto-Scroll ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('assistant', {
        body: { prompt: text },
      });

      if (error) throw error;

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err: any) {
      console.error("AI Error:", err);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        text: `I'm having trouble connecting. (Error: ${err.message || "Unknown"})`,
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Cooking Assistant</h1>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-gray-500 font-medium">Online</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setMessages([messages[0]])}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition"
          title="Reset Chat"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-6 overflow-y-auto pb-32">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-gray-900 text-white" : msg.isError ? "bg-red-100 text-red-600" : "bg-indigo-600 text-white"}`}>
              {msg.role === "user" ? <User className="w-5 h-5" /> : msg.isError ? <AlertTriangle className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            </div>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === "user" ? "bg-white border border-gray-100 text-gray-800 rounded-tr-none" : msg.isError ? "bg-red-50 border border-red-100 text-red-800 rounded-tl-none" : "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-none"}`}>
              <div className="whitespace-pre-wrap font-sans">
                {msg.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
              </div>
              <div className={`text-[10px] mt-2 opacity-50 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0"><ChefHat className="w-5 h-5" /></div>
            <div className="bg-indigo-50 border border-indigo-100 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 w-full z-20">
        <div className="max-w-3xl mx-auto space-y-4">
          {!isTyping && messages.length < 3 && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} onClick={() => handleSend(suggestion)} className="whitespace-nowrap px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full hover:bg-indigo-50 hover:text-indigo-600 border border-transparent hover:border-indigo-200 transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {suggestion}
                </button>
              ))}
            </div>
          )}
          <div className="relative flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask for a recipe..." className="w-full bg-gray-100 border-none rounded-xl py-3.5 pl-5 pr-12 focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none shadow-inner" disabled={isTyping} />
            <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center"><p className="text-[10px] text-gray-400">AI Chef can make mistakes. Please verify nutritional info.</p></div>
        </div>
      </div>
    </div>
  );
}