import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Activity, Heart, Thermometer, Calendar, 
   AlertCircle, CheckCircle2, Plus, X 
} from "lucide-react";

type MedicalRecord = {
  id?: string;
  blood_sugar_level: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  cholesterol_level: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  conditions: string[];
  medications: string[];
  last_checkup: string | null;
};

export default function Health() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [record, setRecord] = useState<MedicalRecord>({
    blood_sugar_level: null,
    blood_pressure_systolic: null,
    blood_pressure_diastolic: null,
    cholesterol_level: null,
    weight_kg: null,
    height_cm: null,
    conditions: [],
    medications: [],
    last_checkup: null,
  });

  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
          .from('medical_records')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setRecord({
            ...data,
            conditions: data.conditions || [],
            medications: data.medications || []
          });
        }
      } catch (error) {
        // No record found is fine, we'll create one on save
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");

      const payload = {
        user_id: user.id,
        ...record,
        updated_at: new Date().toISOString()
      };

      // Upsert based on user_id constraint
      const { error } = await supabase
        .from('medical_records')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;
      setMessage({ text: "Health data updated successfully!", type: 'success' });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to save data.", type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addItem = (field: 'conditions' | 'medications', value: string, setter: (s: string) => void) => {
    if (!value.trim()) return;
    setRecord(prev => ({
      ...prev,
      [field]: [...prev[field], value.trim()]
    }));
    setter("");
  };

  const removeItem = (field: 'conditions' | 'medications', index: number) => {
    setRecord(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading health data...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-red-500" />
            Health Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Update your medical vitals to get personalized, safe meal recommendations.
          </p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Vitals Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Heart className="w-5 h-5 text-pink-500" /> Vitals & Metrics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Blood Sugar (mg/dL)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 90"
                value={record.blood_sugar_level ?? ""}
                onChange={e => setRecord({...record, blood_sugar_level: e.target.value ? parseInt(e.target.value) : null})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Cholesterol (mg/dL)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="e.g. 180"
                value={record.cholesterol_level ?? ""}
                onChange={e => setRecord({...record, cholesterol_level: e.target.value ? parseInt(e.target.value) : null})}
              />
            </div>
          </div>

          <div className="space-y-1">
             <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Blood Pressure (mmHg)</label>
             <div className="flex items-center gap-2">
               <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Systolic (120)"
                  value={record.blood_pressure_systolic ?? ""}
                  onChange={e => setRecord({...record, blood_pressure_systolic: e.target.value ? parseInt(e.target.value) : null})}
               />
               <span className="text-gray-400">/</span>
               <input 
                  type="number" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Diastolic (80)"
                  value={record.blood_pressure_diastolic ?? ""}
                  onChange={e => setRecord({...record, blood_pressure_diastolic: e.target.value ? parseInt(e.target.value) : null})}
               />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Weight (kg)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="kg"
                value={record.weight_kg ?? ""}
                onChange={e => setRecord({...record, weight_kg: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Height (cm)</label>
              <input 
                type="number" 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="cm"
                value={record.height_cm ?? ""}
                onChange={e => setRecord({...record, height_cm: e.target.value ? parseFloat(e.target.value) : null})}
              />
            </div>
          </div>
          
           <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Last Checkup Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input 
                  type="date" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={record.last_checkup ?? ""}
                  onChange={e => setRecord({...record, last_checkup: e.target.value})}
                />
              </div>
            </div>
        </div>

        {/* Conditions & Meds Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-100 mb-4">
              <Thermometer className="w-5 h-5 text-orange-500" /> Medical Context
            </h2>

            {/* Conditions */}
            <div className="mb-6">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Existing Conditions / Allergies</label>
               <div className="flex gap-2 mb-3">
                 <input 
                   className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g. Diabetes, Peanut Allergy"
                   value={newCondition}
                   onChange={e => setNewCondition(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('conditions', newCondition, setNewCondition))}
                 />
                 <button 
                   type="button" 
                   onClick={() => addItem('conditions', newCondition, setNewCondition)}
                   className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {record.conditions.map((c, i) => (
                   <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1 border border-orange-100">
                     {c} <button type="button" onClick={() => removeItem('conditions', i)}><X className="w-3 h-3 hover:text-red-500" /></button>
                   </span>
                 ))}
                 {record.conditions.length === 0 && <span className="text-sm text-gray-400 italic">None listed</span>}
               </div>
            </div>

            {/* Medications */}
            <div className="flex-1">
               <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Current Medications</label>
               <div className="flex gap-2 mb-3">
                 <input 
                   className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                   placeholder="e.g. Metformin"
                   value={newMedication}
                   onChange={e => setNewMedication(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem('medications', newMedication, setNewMedication))}
                 />
                 <button 
                   type="button" 
                   onClick={() => addItem('medications', newMedication, setNewMedication)}
                   className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 transition"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
               <div className="flex flex-wrap gap-2">
                 {record.medications.map((m, i) => (
                   <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1 border border-blue-100">
                     {m} <button type="button" onClick={() => removeItem('medications', i)}><X className="w-3 h-3 hover:text-red-500" /></button>
                   </span>
                 ))}
                 {record.medications.length === 0 && <span className="text-sm text-gray-400 italic">None listed</span>}
               </div>
            </div>
            
            {/* Warning Note */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-100 flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-xs text-yellow-800 leading-relaxed">
                <strong>Note:</strong> This data is used solely to personalize your AI meal recommendations. 
                Nourishly is not a substitute for professional medical advice.
              </p>
            </div>

          </div>
        </div>
        
        {/* Action Bar */}
        <div className="md:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <CheckCircle2 className="w-5 h-5" />}
            Save Health Profile
          </button>
        </div>

      </form>
    </div>
  );
}
