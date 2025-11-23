import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { 
  ChefHat, ShoppingBasket, MessageSquare, ArrowRight, 
  Flame, TrendingUp, Clock, Sun, Moon, Coffee
} from "lucide-react";

export default function Home() {
  const [name, setName] = useState("Chef");
  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState("Morning");

  useEffect(() => {
    // 1. Determine Time of Day
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay("Morning");
    else if (hour < 18) setTimeOfDay("Afternoon");
    else setTimeOfDay("Evening");

    // 2. Fetch User Name
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to get profile name, fallback to metadata, fallback to "Chef"
        const { data } = await supabase.from("profiles").select("display_name, full_name").eq("id", user.id).single();
        const bestName = data?.display_name || data?.full_name || user.user_metadata?.full_name || "Chef";
        setName(bestName.split(" ")[0]); // Just first name
      }
      setLoading(false);
    }
    getUser();
  }, []);

  const getTimeIcon = () => {
    if (timeOfDay === "Morning") return <Coffee className="w-6 h-6 text-orange-400" />;
    if (timeOfDay === "Afternoon") return <Sun className="w-6 h-6 text-yellow-500" />;
    return <Moon className="w-6 h-6 text-indigo-400" />;
  };

  if (loading) return <div className="min-h-screen bg-gray-50" />;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- Hero Section --- */}
      <div className="bg-white border-b border-gray-100 pb-12 pt-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getTimeIcon()}
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">{timeOfDay} Dashboard</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Good {timeOfDay.toLowerCase()}, <span className="text-indigo-600">{name}</span>.
              </h1>
              <p className="text-gray-500 mt-2 text-lg">
                Ready to cook something delicious today?
              </p>
            </div>
            
            {/* Daily Goal Widget */}
            <div className="bg-indigo-50 rounded-2xl p-4 flex items-center gap-4 min-w-[240px]">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm text-indigo-600 font-bold uppercase">Daily Target</div>
                <div className="text-gray-900 font-bold text-lg">1,250 <span className="text-sm text-gray-400 font-normal">/ 2,000 kcal</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        
        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Card 1: Recipes */}
          <Link to="/recipes" className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-orange-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ChefHat className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Browse Recipes</h3>
              <p className="text-gray-500 text-sm mb-4">Find meals matching your diet.</p>
              <div className="flex items-center text-orange-600 text-sm font-bold">
                Explore Now <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Pantry */}
          <Link to="/pantry" className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ShoppingBasket className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">My Pantry</h3>
              <p className="text-gray-500 text-sm mb-4">Manage ingredients & expiry.</p>
              <div className="flex items-center text-green-600 text-sm font-bold">
                Update Items <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Assistant */}
          <Link to="/assistant" className="group bg-white p-6 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 hover:border-purple-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">AI Chef</h3>
              <p className="text-gray-500 text-sm mb-4">Ask for meal ideas & tips.</p>
              <div className="flex items-center text-purple-600 text-sm font-bold">
                Start Chat <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* --- Status Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Featured Recipe (Big Card) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recommended for You</h2>
              <Link to="/recipes" className="text-sm text-indigo-600 font-medium hover:underline">View all</Link>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
              <div className="md:w-2/5 h-48 md:h-auto relative">
                <img 
                  src="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600" 
                  alt="Featured" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 25 min
                </div>
              </div>
              <div className="p-6 flex flex-col justify-center flex-1">
                <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">Trending in your region</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Spicy Garlic Stir-Fry</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  A quick and healthy stir-fry using fresh ingredients. Perfect for a weeknight dinner.
                </p>
                <div className="flex items-center gap-4">
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition">
                    View Recipe
                  </button>
                  <div className="text-sm text-gray-500 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" /> 420 kcal
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-lg font-bold text-gray-900">Your Activity</h2>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
              {/* Stat 1 */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-gray-700">Protein</span>
                    <span className="text-sm text-gray-500">45/60g</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[75%] bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>

               {/* Stat 2 */}
               <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <ShoppingBasket className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold text-gray-700">Pantry Health</span>
                    <span className="text-sm text-gray-500">Good</span>
                  </div>
                   <div className="text-xs text-gray-400">
                     You have 2 items expiring soon.
                   </div>
                </div>
              </div>

              <Link to="/profile" className="block w-full py-2 text-center text-sm font-medium text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                View Full Profile
              </Link>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}