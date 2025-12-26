import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useLocation } from "react-router-dom";
import { 
  Send, Bot, User, Sparkles, ChefHat, RotateCcw, 
  AlertTriangle, PlusCircle, CheckCircle2, History, X, Clock, Trash2, ShoppingBasket,
} from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
  isError?: boolean;
  ingredients?: string[]; 
  addedToPantry?: boolean; 
};

const SUGGESTIONS = [
  "What can I cook with my pantry?",
  "Give me a high-protein breakfast idea.",
  "I have too many tomatoes. Recipe ideas?",
  "Explain the health benefits of turmeric."
];

export default function Assistant() {
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasRunRef = useRef(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // State for the modal
  const [viewingMessageId, setViewingMessageId] = useState<string | null>(null);
  const [viewingItems, setViewingItems] = useState<string[] | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // --- 1. PERSISTENCE LOGIC (2-Hour Memory & Archives) ---
  const [archivedSessions, setArchivedSessions] = useState<Message[][]>(() => {
    try {
      const saved = localStorage.getItem("nourishly_archived_chats");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMsgs = localStorage.getItem("nourishly_chat");
      const savedTime = localStorage.getItem("nourishly_chat_time");

      if (savedMsgs && savedTime) {
        const age = new Date().getTime() - parseInt(savedTime);
        const twoHours = 2 * 60 * 60 * 1000;

        if (age < twoHours) {
          return JSON.parse(savedMsgs).map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        } else {
          // If expired, maybe we should archive it automatically? 
          // For simplicity, we just start fresh, but you could add logic here.
        }
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [{
      id: "1",
      role: "assistant",
      text: "Hello! I'm your AI Chef. I can help you find recipes. What are we cooking today?",
      timestamp: new Date(),
    }];
  });

  // Save chat on every update
  useEffect(() => {
    localStorage.setItem("nourishly_chat", JSON.stringify(messages));
    localStorage.setItem("nourishly_chat_time", new Date().getTime().toString());
  }, [messages]);

  // Reset function: Archives current session then clears
  const handleReset = () => {
    if (messages.length > 1) {
      const newArchives = [messages, ...archivedSessions].slice(0, 20);
      setArchivedSessions(newArchives);
      localStorage.setItem("nourishly_archived_chats", JSON.stringify(newArchives));
    }

    const defaultMsg: Message = {
      id: "1",
      role: "assistant",
      text: "Hello! I'm your AI Chef. I can help you find recipes. What are we cooking today?",
      timestamp: new Date(),
    };
    setMessages([defaultMsg]);
    localStorage.removeItem("nourishly_chat");
    localStorage.setItem("nourishly_chat_time", new Date().getTime().toString());
  };

  const handleRestoreSession = (session: Message[]) => {
    // Restore and fix Date objects
    const restored = session.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    setMessages(restored);
    setShowHistory(false);
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to delete all saved history?")) {
      setArchivedSessions([]);
      localStorage.removeItem("nourishly_archived_chats");
    }
  };

  // --- Auto-Start from Recipe Page ---
  useEffect(() => {
    if (hasRunRef.current) return;
    if (location.state?.startCooking) {
      const recipeName = location.state.startCooking;
      handleSend(`I want to cook ${recipeName}. Guide me and list the ingredients.`);
      hasRunRef.current = true;
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // --- Modal Helpers ---
  const openIngredientModal = (msgId: string, items: string[]) => {
    setViewingMessageId(msgId);
    setViewingItems(items);
    // Default select all
    setSelectedItems(new Set(items));
  };

  const toggleItemSelection = (item: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setSelectedItems(newSet);
  };

  // --- 2. AUTO-CONTINUE LOGIC ---
  const addToPantry = async (messageId: string, ingredientsToAdd: string[]) => {
    if (ingredientsToAdd.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const itemsToInsert = ingredientsToAdd.map(name => ({
        user_id: user.id,
        name: name.trim(),
        category: "Other",
        quantity: "1 unit"
      }));

      const { error } = await supabase.from("pantry_items").insert(itemsToInsert);
      if (error) throw error;

      // Mark button as clicked in the chat history
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, addedToPantry: true } : msg
      ));
      
      // Close modal if open
      setViewingItems(null);
      setViewingMessageId(null);

      setTimeout(() => {
        handleSend(`I have added ${ingredientsToAdd.length} items to my pantry. Please start the step-by-step cooking guide now.`);
      }, 500); 

    } catch (err) {
      console.error("Failed to add items", err);
      alert("Failed to add items to pantry.");
    }
  };

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

      let cleanText = data.reply;
      let detectedIngredients: string[] | undefined = undefined;

      const parts = data.reply.split("+++INGREDIENTS:");
      if (parts.length > 1) {
        cleanText = parts[0].trim();
        const rawList = parts[1].split("+++")[0];
        detectedIngredients = rawList.split(",").map((s: string) => s.trim()).filter(s => s.length > 0);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: cleanText,
        timestamp: new Date(),
        ingredients: detectedIngredients,
      };
      setMessages((prev) => [...prev, aiMsg]);

    } catch (err: any) {
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        text: "Connection error. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full text-indigo-600"><Bot className="w-6 h-6" /></div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Chef Assistant</h1>
            <div className="flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span><span className="text-xs text-gray-500 font-medium">Ready to help!</span></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHistory(true)} 
            className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition" 
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
          <button 
            onClick={handleReset} 
            className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition" 
            title="Clear Current Chat"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- INGREDIENT LIST MODAL (Fixed Position) --- */}
      {viewingItems && viewingMessageId && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBasket className="w-5 h-5 text-indigo-600" />
                  Select Ingredients
                </h3>
                <p className="text-sm text-gray-500">Select items to add to your pantry</p>
              </div>
              <button 
                onClick={() => setViewingItems(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
              <ul className="space-y-2">
                {viewingItems.map((item, i) => {
                  const isSelected = selectedItems.has(item);
                  return (
                    <li 
                      key={i} 
                      onClick={() => toggleItemSelection(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? "text-indigo-900" : "text-gray-700"}`}>
                        {item}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Footer Actions */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setViewingItems(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => addToPantry(viewingMessageId, Array.from(selectedItems))}
                disabled={selectedItems.size === 0}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Add {selectedItems.size} Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HISTORY SLIDE-OVER --- */}
      {showHistory && (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[2px] flex justify-end transition-opacity">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" /> 
                Past Conversations
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {archivedSessions.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <History className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No history yet</p>
                  <p className="text-xs text-gray-400 mt-1">Chats are saved here when you click "Clear Current Chat".</p>
                </div>
              ) : (
                archivedSessions.map((session, idx) => {
                  const firstUserMsg = session.find(m => m.role === "user")?.text || "New Conversation";
                  const lastMsgTime = new Date(session[session.length - 1].timestamp);
                  
                  return (
                    <button 
                      key={idx}
                      onClick={() => handleRestoreSession(session)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 bg-white hover:border-indigo-300 hover:shadow-md transition-all group group-hover:bg-indigo-50/30"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1 group-hover:text-indigo-500">
                          <Clock className="w-3 h-3" /> 
                          {lastMsgTime.toLocaleDateString()}
                        </span>
                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600">
                          {session.length} msgs
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 font-medium line-clamp-2 leading-snug">
                        {firstUserMsg}
                      </p>
                    </button>
                  );
                })
              )}
            </div>

            {archivedSessions.length > 0 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button 
                  onClick={clearAllHistory}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Clear All History
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-6 overflow-y-auto pb-32 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-gray-900 text-white" : msg.isError ? "bg-red-100 text-red-600" : "bg-indigo-600 text-white"}`}>
              {msg.role === "user" ? <User className="w-5 h-5" /> : msg.isError ? <AlertTriangle className="w-5 h-5" /> : <ChefHat className="w-5 h-5" />}
            </div>
            
            <div className={`max-w-[85%] flex flex-col items-start`}>
              <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${msg.role === "user" ? "bg-white border border-gray-100 text-gray-800 rounded-tr-none" : "bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-tl-none"}`}>
                <div className="whitespace-pre-wrap font-sans">
                  {msg.text.split("**").map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </div>
              </div>

              {/* --- ACTION BUTTONS --- */}
              {msg.ingredients && msg.ingredients.length > 0 && (
                <div className="mt-2 ml-1 flex gap-2">
                  <button 
                    onClick={() => openIngredientModal(msg.id, msg.ingredients!)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
                    title="View and Select Ingredients"
                  >
                    <ShoppingBasket className="w-4 h-4" /> View List
                  </button>

                  {msg.addedToPantry ? (
                    <button disabled className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl text-xs font-bold border border-green-200 cursor-default">
                      <CheckCircle2 className="w-4 h-4" /> Added
                    </button>
                  ) : (
                    // Quick add all (optional, can remove if you only want modal flow)
                     null
                  )}
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}