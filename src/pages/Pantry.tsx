import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Trash2, Plus, ShoppingBasket, Calendar, Package, AlertCircle } from "lucide-react";

// --- Types ---
type PantryItem = {
  id: string;
  name: string;
  quantity: string;
  category: string;
  expiry_date: string | null;
};

const CATEGORIES = [
  { name: "Produce", emoji: "🥦" },
  { name: "Dairy", emoji: "🧀" },
  { name: "Meat", emoji: "🥩" },
  { name: "Grains", emoji: "🌾" },
  { name: "Spices", emoji: "🌶️" },
  { name: "Canned", emoji: "🥫" },
  { name: "Beverages", emoji: "🧃" },
  { name: "Other", emoji: "📦" },
];

export default function Pantry() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("All");

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    category: "Other",
    expiry_date: "",
  });

  useEffect(() => {
    fetchPantry();
  }, []);

  async function fetchPantry() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("pantry_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error("Error loading pantry:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name) return;
    setAdding(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const payload = {
        user_id: user.id,
        name: newItem.name,
        quantity: newItem.quantity,
        category: newItem.category,
        expiry_date: newItem.expiry_date || null,
      };

      const { data, error } = await supabase.from("pantry_items").insert([payload]).select().single();
      if (error) throw error;
      
      setItems([data, ...items]);
      setNewItem({ name: "", quantity: "", category: "Other", expiry_date: "" });
    } catch (err) {
      alert("Failed to add item");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: string) {
    setItems(items.filter((item) => item.id !== id));
    await supabase.from("pantry_items").delete().eq("id", id);
  }

  const getDaysUntilExpiry = (dateStr: string | null) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    return days;
  };

  const getEmoji = (catName: string) => {
    return CATEGORIES.find(c => c.name === catName)?.emoji || "📦";
  };

  const filteredItems = filter === "All" ? items : items.filter(item => item.category === filter);
  const expiringCount = items.filter(i => i.expiry_date && getDaysUntilExpiry(i.expiry_date)! <= 3).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-10 text-white shadow-lg border border-green-200 rounded-2xl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShoppingBasket className="w-8 h-8 text-green-200" />
              Kitchen Inventory
            </h1>
            <p className="text-green-100 mt-2 text-lg opacity-90">
              Manage your ingredients.
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-white/20">
              <Package className="w-5 h-5 text-green-200" />
              <div>
                <div className="text-2xl font-bold leading-none">{items.length}</div>
                <div className="text-xs text-green-200 uppercase tracking-wider font-semibold">Items</div>
              </div>
            </div>
            {expiringCount > 0 && (
              <div className="bg-red-500/20 backdrop-blur-md px-4 py-3 rounded-2xl flex items-center gap-3 border border-red-400/30">
                <AlertCircle className="w-5 h-5 text-red-200" />
                <div>
                  <div className="text-2xl font-bold leading-none">{expiringCount}</div>
                  <div className="text-xs text-red-100 uppercase tracking-wider font-semibold">Expiring</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-8">
        
        {/* Left Column: Add Form */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Add New Item</h2>
            </div>

            <form onSubmit={handleAdd} className="space-y-5">
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rice"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">Quantity</label>
                  <input
                    type="text"
                    placeholder="e.g. 1kg"
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">Category</label>
                  <select
                    className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none appearance-none"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 ml-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full rounded-xl border-gray-200 bg-gray-50 px-4 py-3 text-gray-600 focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all outline-none"
                  value={newItem.expiry_date}
                  onChange={(e) => setNewItem({ ...newItem, expiry_date: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={adding}
                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 active:scale-[0.98] transition-all shadow-md shadow-green-200 disabled:opacity-50 disabled:active:scale-100 mt-2"
              >
                {adding ? "Adding..." : "Add to Inventory"}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             <button onClick={() => setFilter("All")} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === "All" ? "bg-gray-800 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>All Items</button>
            {CATEGORIES.map((cat) => (
              <button key={cat.name} onClick={() => setFilter(cat.name)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === cat.name ? "bg-green-600 text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"}`}>{cat.emoji} {cat.name}</button>
            ))}
          </div>

          {loading ? (
            <div className="grid gap-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse"></div>)}</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-300">
              <div className="text-6xl mb-4 grayscale opacity-50">🧺</div>
              <h3 className="text-xl font-bold text-gray-900">No items found</h3>
              <p className="text-gray-500 mt-1">Add some groceries to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const daysLeft = getDaysUntilExpiry(item.expiry_date);
                let badgeStyle = "bg-gray-100 text-gray-500";
                let expiryText = "";
                if (daysLeft !== null) {
                  if (daysLeft < 0) { badgeStyle = "bg-red-100 text-red-700 ring-1 ring-red-200"; expiryText = "Expired"; }
                  else if (daysLeft <= 3) { badgeStyle = "bg-orange-100 text-orange-700 ring-1 ring-orange-200"; expiryText = `Exp: ${daysLeft} days`; }
                  else { badgeStyle = "bg-green-100 text-green-700 ring-1 ring-green-200"; expiryText = `${daysLeft} days left`; }
                }
                return (
                  <div key={item.id} className="group bg-white p-4 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300">{getEmoji(item.category)}</div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{item.name}</h3>
                        <div className="text-sm text-gray-400 font-medium flex items-center gap-2 mt-0.5">
                          <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.category}</span>
                          {item.quantity && <><span className="w-1 h-1 bg-gray-300 rounded-full"></span><span>{item.quantity}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {item.expiry_date && <div className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${badgeStyle}`}><Calendar className="w-3.5 h-3.5" />{expiryText}</div>}
                      <button onClick={() => handleDelete(item.id)} className="h-10 w-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-red-50 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}