import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Camera, Save, RefreshCw, Globe, Activity, Utensils } from "lucide-react";

// --- Types ---
type ProfileRow = {
  id?: string;
  full_name?: string;
  display_name?: string;
  age?: number | null; // <--- ADDED AGE TYPE
  country?: string;
  region?: string;
  city?: string;
  hemisphere?: string;
  calorie_goal?: number | null;
  dietary_prefs?: string[] | null;
  allergies?: string[] | null;
  preferred_cuisines?: string[] | null;
  avatar_url?: string | null;
  created_at?: string | null;
};

const DEFAULT_AVATAR = "https://via.placeholder.com/150?text=Avatar";

// --- LOCATION DATA ---
const LOCATION_DATA: Record<string, string[]> = {
  "India": [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
  ],
  "United States": [
    "Alabama", "Alaska", "Arizona", "California", "Colorado", "Florida", "Georgia", 
    "Hawaii", "Illinois", "New York", "Texas", "Washington"
  ],
  "United Kingdom": [
    "England", "Scotland", "Wales", "Northern Ireland"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Ontario", "Quebec"
  ],
  "Other": ["Other"]
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [profile, setProfile] = useState<ProfileRow>({
    full_name: "",
    display_name: "",
    age: null, // <--- INIT AGE
    country: "",
    region: "",
    city: "",
    hemisphere: "",
    avatar_url: null,
    calorie_goal: null,
    dietary_prefs: [],
    allergies: [],
    preferred_cuisines: [],
  });

  // --- Helper: Tag Input Logic ---
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>, field: keyof ProfileRow) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = e.currentTarget.value.trim();
      if (val) {
        const currentTags = (profile[field] as string[]) || [];
        if (!currentTags.includes(val)) {
          updateField(field, [...currentTags, val]);
        }
        e.currentTarget.value = "";
      }
    }
  };

  const removeTag = (tagToRemove: string, field: keyof ProfileRow) => {
    const currentTags = (profile[field] as string[]) || [];
    updateField(field, currentTags.filter(t => t !== tagToRemove));
  };

  // --- Load Data ---
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setEmail(user.email || "");

        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (mounted && data) {
          setProfile(prev => ({ ...prev, ...data }));
        } else if (mounted) {
          setProfile(prev => ({ ...prev, id: user.id }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // --- Actions ---
  const updateField = <K extends keyof ProfileRow>(key: K, value: ProfileRow[K]) => {
    setProfile(prev => {
      const next = { ...prev, [key]: value };
      if (key === "country" && typeof value === "string") {
        const southern = ["Australia", "New Zealand", "Argentina", "Chile", "South Africa", "Brazil"];
        next.hemisphere = southern.includes(value) ? "Southern" : "Northern";
      }
      return next;
    });
  };

  // Handle Country Change
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountry = e.target.value;
    setProfile(prev => ({
      ...prev,
      country: newCountry,
      region: "", 
      hemisphere: ["Australia", "New Zealand", "South Africa"].includes(newCountry) ? "Southern" : "Northern"
    }));
  };

  const handleFile = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const ext = file.name.split(".").pop();
      const filePath = `avatars/${user.id}-${Date.now()}.${ext}`;
      
      const { error: uploadErr } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      
      updateField("avatar_url", publicUrl);
      await supabase.from("profiles").upsert({ id: user.id, avatar_url: publicUrl });
      setMessage({ text: "Photo updated!", type: 'success' });
    } catch (err) {
      setMessage({ text: "Upload failed", type: 'error' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      
      const { error } = await supabase.from("profiles").upsert({ id: user.id, ...profile });
      if (error) throw error;
      setMessage({ text: "Profile saved successfully", type: 'success' });
    } catch (err) {
      setMessage({ text: "Failed to save profile", type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* --- Hero Header --- */}
      <div className="relative bg-gradient-to-r from-indigo-700 to-purple-800 h-48">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="max-w-5xl mx-auto px-6 h-full flex items-center relative z-10">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-20 relative z-20">
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* --- Left Column: Identity --- */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                  <img src={profile.avatar_url || DEFAULT_AVATAR} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-md">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
                </label>
              </div>
              
              <div className="mt-4 w-full">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Display Name</label>
                <input 
                  className="mt-1 w-full text-center text-lg font-bold text-gray-800 border-b border-gray-200 focus:border-indigo-500 outline-none py-1 bg-transparent"
                  placeholder="Chef Name"
                  value={profile.display_name || ""}
                  onChange={(e) => updateField("display_name", e.target.value)}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">{email}</p>
              
              <div className="mt-6 w-full pt-6 border-t border-gray-100">
                 <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-semibold text-left">Full Name</div>
                 <input 
                    className="w-full bg-gray-50 rounded-lg px-3 py-2 text-sm border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-100 transition outline-none"
                    placeholder="John Doe"
                    value={profile.full_name || ""}
                    onChange={(e) => updateField("full_name", e.target.value)}
                 />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-green-500" />
                Account Status
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Member Since</span>
                  <span className="font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Plan</span>
                  <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold">FREE</span>
                </div>
              </div>
            </div>
          </div>

          {/* --- Right Column: Settings --- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Location Section */}
            <Section title="Location & Time" icon={<Globe className="w-5 h-5 text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Country">
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none"
                    value={profile.country || ""}
                    onChange={handleCountryChange}
                  >
                    <option value="" disabled>Select Country</option>
                    {Object.keys(LOCATION_DATA).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </InputGroup>

                <InputGroup label="State / Region">
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 outline-none transition appearance-none disabled:opacity-50"
                    value={profile.region || ""}
                    onChange={(e) => updateField("region", e.target.value)}
                    disabled={!profile.country}
                  >
                    <option value="" disabled>Select State</option>
                    {profile.country && LOCATION_DATA[profile.country]?.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                    {!profile.country && <option>Select Country First</option>}
                  </select>
                </InputGroup>

                <InputGroup label="City">
                  <input 
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    value={profile.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="e.g. Mumbai"
                  />
                </InputGroup>
                 <InputGroup label="Hemisphere (Auto)">
                  <input 
                    readOnly
                    className="w-full bg-gray-100 text-gray-500 border border-gray-200 rounded-lg px-4 py-2.5 cursor-not-allowed"
                    value={profile.hemisphere || "Northern"}
                  />
                </InputGroup>
              </div>
            </Section>

            {/* Health & Preferences */}
            <Section title="Dietary & Health" icon={<Utensils className="w-5 h-5 text-orange-500" />}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* --- NEW AGE INPUT --- */}
                  <InputGroup label="Age">
                    <input 
                      type="number"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                      value={profile.age ?? ""}
                      onChange={(e) => updateField("age", parseInt(e.target.value))}
                      placeholder="e.g. 25"
                    />
                  </InputGroup>

                  <InputGroup label="Daily Calorie Goal">
                    <div className="relative">
                      <input 
                        type="number"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-100 outline-none transition pl-12"
                        value={profile.calorie_goal ?? ""}
                        onChange={(e) => updateField("calorie_goal", parseInt(e.target.value))}
                        placeholder="2000"
                      />
                      <span className="absolute left-4 top-2.5 text-gray-400 font-medium">kcal</span>
                    </div>
                  </InputGroup>
               </div>

                <div className="mt-4">
                  <TagInput 
                    label="Dietary Preferences" 
                    placeholder="Type e.g. Vegan, Keto and hit Enter..."
                    tags={profile.dietary_prefs || []}
                    onRemove={(tag: string) => removeTag(tag, "dietary_prefs")}
                    onKeyDown={(e: any) => handleTagInput(e, "dietary_prefs")}
                    color="green"
                  />
                </div>
                
                <div className="mt-4">
                  <TagInput 
                    label="Allergies" 
                    placeholder="Type e.g. Peanuts, Gluten and hit Enter..."
                    tags={profile.allergies || []}
                    onRemove={(tag: string) => removeTag(tag, "allergies")}
                    onKeyDown={(e: any) => handleTagInput(e, "allergies")}
                    color="red"
                  />
                </div>

                 <div className="mt-4">
                  <TagInput 
                    label="Favorite Cuisines" 
                    placeholder="Type e.g. Italian, Thai and hit Enter..."
                    tags={profile.preferred_cuisines || []}
                    onRemove={(tag: string) => removeTag(tag, "preferred_cuisines")}
                    onKeyDown={(e: any) => handleTagInput(e, "preferred_cuisines")}
                    color="blue"
                  />
                </div>
            </Section>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4">
              <div className={`text-sm font-medium transition-opacity duration-300 ${message ? 'opacity-100' : 'opacity-0'} ${message?.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                {message?.text}
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition flex items-center gap-2"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </div>
          
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Sub Components ---

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {title}
      </h3>
      {children}
    </div>
  );
}

function InputGroup({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wide ml-1">{label}</label>
      {children}
    </div>
  );
}

function TagInput({ label, placeholder, tags, onRemove, onKeyDown, color }: any) {
  const colorStyles: any = {
    green: "bg-green-100 text-green-700 hover:bg-green-200",
    red: "bg-red-100 text-red-700 hover:bg-red-200",
    blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  };

  return (
    <InputGroup label={label}>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:bg-white transition">
        {tags.map((tag: string) => (
          <span key={tag} className={`px-2 py-1 rounded-md text-sm font-medium flex items-center gap-1 cursor-pointer transition ${colorStyles[color]}`} onClick={() => onRemove(tag)}>
            {tag} <span className="opacity-50 hover:opacity-100">×</span>
          </span>
        ))}
        <input 
          className="bg-transparent outline-none flex-grow min-w-[120px] px-1 py-1 text-sm"
          placeholder={tags.length === 0 ? placeholder : ""}
          onKeyDown={onKeyDown}
        />
      </div>
    </InputGroup>
  );
}