"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/firebase/config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Trash2, Edit, Download, Plus, Search, ShieldAlert, X } from "lucide-react";

interface Member {
  name: string;
  usn: string;
  semester: string;
  branch: string;
  email: string;
  phone: string;
  stay: string;
  hostelName: string;
}

interface Registration {
  id: string;
  teamId?: string;
  teamName: string;
  act: string;
  leadName: string;
  usn: string;
  semester: string;
  branch: string;
  email: string;
  phone: string;
  stay: string;
  hostelName: string;
  members: Member[];
  placement?: string;
  createdAt: any;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [awardsReleased, setAwardsReleased] = useState(false);
  
  const [filterAct, setFilterAct] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Registration>>({ teamName: "", act: "", leadName: "", usn: "", email: "", phone: "", branch: "", semester: "", stay: "local", hostelName: "", members: [] });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (usr) {
        // Fetch Settings
        const unsubSet = onSnapshot(doc(db, "settings", "general"), (d) => {
          if (d.exists()) {
            setIsOpen(d.data().isRegistrationOpen ?? true);
            setAwardsReleased(d.data().isAwardsAnnounced ?? false);
          }
        });
        
        // Fetch Teams
        const q = query(collection(db, "registrations"), orderBy("createdAt", "desc"));
        const unsubReg = onSnapshot(q, (snap) => {
          const data: Registration[] = [];
          snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Registration));
          setRegistrations(data);
        });

        return () => { unsubSet(); unsubReg(); };
      }
    });
    return () => unsubAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError("");
    } catch (err: any) {
      setLoginError("Access Denied. Invalid credentials or insufficient permissions.");
    }
  };

  const toggleRegistrations = async () => {
    await setDoc(doc(db, "settings", "general"), { isRegistrationOpen: !isOpen }, { merge: true });
  };

  const toggleAwards = async () => {
    await setDoc(doc(db, "settings", "general"), { isAwardsAnnounced: !awardsReleased }, { merge: true });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this team's registration?")) {
      await deleteDoc(doc(db, "registrations", id));
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ teamName: "", act: "", leadName: "", usn: "", email: "", phone: "", branch: "", semester: "", stay: "local", hostelName: "", members: [] });
    setModalOpen(true);
  };

  const openEditModal = (reg: Registration) => {
    setEditId(reg.id);
    setFormData({ ...reg });
    setModalOpen(true);
  };

  const handleModalSave = async () => {
    if (!formData.teamName || !formData.act || !formData.leadName) return alert("Missing required fields: Team Name, Act, Lead Name");
    try {
      if (editId) {
        await updateDoc(doc(db, "registrations", editId), { ...formData });
      } else {
        await addDoc(collection(db, "registrations"), { ...formData, createdAt: serverTimestamp() });
      }
      setModalOpen(false);
    } catch (err) {
      alert("Error overriding dataset.");
    }
  };

  const updatePlacement = async (id: string, val: string) => {
    await updateDoc(doc(db, "registrations", id), { placement: val });
  };

  const wipeAllData = async () => {
    const confirmation = confirm("This will attempt to delete all visible registrations. If it fails due to permissions, please use the 'Manual Purge' guide below. Proceed?");
    if (!confirmation) return;
    
    try {
      const deletePromises = registrations.map(reg => deleteDoc(doc(db, "registrations", reg.id)));
      await Promise.all(deletePromises);
      alert("Database wipe attempted. Please refresh the page. If teams persist, use the Firebase Console for a Manual Purge.");
    } catch (err) {
      alert("Wipe failed (Permission Error). Use the Manual Purge instructions.");
    }
  };

  const resetCounter = async () => {
    if (!confirm("This will force the next registration to be IS-KT-001. Are you sure?")) return;
    try {
      await setDoc(doc(db, "settings", "counters"), { registrationCount: 0 });
      alert("Counter Reset! The next registration will be IS-KT-001.");
    } catch (err) {
      alert("Counter reset failed. Admin permissions required.");
    }
  };

  const exportCSV = () => {
    const headers = ["Team Name", "Act", "Lead Name", "USN", "Branch", "Email", "Phone", "Stay", "Total Members"];
    const rows = filtered.map(r => [
      `"${r.teamName}"`, r.act, `"${r.leadName}"`, r.usn, r.branch, r.email, r.phone,
      r.stay === "hostel" ? r.hostelName : "Local", (r.members?.length || 0) + 1
    ].join(","));
    const csvContext = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContext], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KALA-Registrations-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.text("KALA-TriVerse Registration Data", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [["Team Name", "Act", "Lead Performer", "USN", "Branch", "Phone", "Stay", "Members"]],
      body: filtered.map(r => [
        r.teamName, r.act, r.leadName, r.usn, r.branch, r.phone, 
        r.stay === "hostel" ? r.hostelName : "Local",
        (r.members?.length || 0) + 1
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [128, 0, 0] }
    });
    doc.save(`KALA-Registrations-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filtered = registrations.filter(r => {
    const matchAct = filterAct ? r.act === filterAct : true;
    const search = searchTerm.toLowerCase();
    const matchSearch = !search || (
      (r.teamName?.toLowerCase() || "").includes(search) || 
      (r.teamId?.toLowerCase() || "").includes(search) ||
      (r.leadName?.toLowerCase() || "").includes(search) || 
      (r.usn?.toLowerCase() || "").includes(search) ||
      (r.branch?.toLowerCase() || "").includes(search) ||
      (r.members || []).some(m => 
        (m.name?.toLowerCase() || "").includes(search) || 
        (m.usn?.toLowerCase() || "").includes(search) || 
        (m.branch?.toLowerCase() || "").includes(search)
      )
    );
    return matchAct && matchSearch;
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-charcoal)] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111] border border-[rgba(212,175,55,0.2)] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[var(--royal-maroon)] to-[var(--antique-gold)]" />
          <div className="flex justify-center mb-6 text-[var(--antique-gold)]"><ShieldAlert size={40} /></div>
          <h1 className="font-cinema text-2xl text-[var(--ivory)] text-center tracking-widest uppercase mb-8">Admin Gateway</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Director Email" className="input-royal w-full px-4 py-3 bg-black text-[var(--ivory)] font-script text-sm" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Authorization Key" className="input-royal w-full px-4 py-3 bg-black text-[var(--ivory)] font-script text-sm" />
            {loginError && <p className="text-[var(--royal-maroon)] text-xs text-center italic">{loginError}</p>}
            <button type="submit" className="engraved-btn font-cinema tracking-widest py-3 mt-4">Authenticate</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-charcoal)] text-[var(--ivory-muted)] p-4 md:p-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#111] p-6 border border-[rgba(212,175,55,0.15)] mb-8">
          <div>
            <h1 className="font-cinema text-3xl text-[var(--ivory)] uppercase tracking-widest mb-1">Control Room</h1>
            <p className="font-script text-xs text-[var(--antique-gold-soft)] tracking-wider">KALA-TriVerse Database Override</p>
          </div>
          <div className="flex items-center gap-6 mt-6 md:mt-0">
            <div className="flex items-center gap-3 bg-black px-4 py-2 border border-[rgba(212,175,55,0.2)]">
              <span className="font-cinema text-xs uppercase tracking-widest">Portal Status:</span>
              <button onClick={toggleRegistrations} className={`text-xs font-bold px-3 py-1 uppercase tracking-wider ${isOpen ? "bg-green-900 text-green-300" : "bg-[var(--royal-maroon)] text-red-200"}`}>
                {isOpen ? "LIVE" : "LOCKED"} 
              </button>
            </div>
            <div className="flex items-center gap-3 bg-black px-4 py-2 border border-[rgba(212,175,55,0.2)]">
              <span className="font-cinema text-xs uppercase tracking-widest">Awards Status:</span>
              <button onClick={toggleAwards} className={`text-xs font-bold px-3 py-1 uppercase tracking-wider ${awardsReleased ? "bg-green-900 text-green-300" : "bg-black text-[var(--antique-gold-soft)] border border-[var(--antique-gold-soft)]"}`}>
                {awardsReleased ? "RELEASED" : "HIDDEN"} 
              </button>
            </div>
            <button onClick={() => signOut(auth)} className="text-[var(--royal-maroon)] hover:text-red-500 transition-colors ml-4">
              <LogOut size={20}/>
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--antique-gold-soft)]" />
              <input type="text" placeholder="Search Team or USN" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-royal pl-10 pr-4 py-2 text-sm w-64 bg-[#111]" />
            </div>
            <select value={filterAct} onChange={e => setFilterAct(e.target.value)} className="input-royal px-4 py-2 text-sm bg-[#111]">
              <option value="">All Acts</option>
              <option value="classical">Classical</option>
              <option value="western">Western</option>
              <option value="folk">Janapada</option>
              <option value="drama">Drama</option>
              <option value="food">Culinary</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <button onClick={openAddModal} className="flex items-center gap-2 bg-[rgba(212,175,55,0.1)] border border-[var(--antique-gold-soft)] text-[var(--ivory)] hover:bg-[var(--antique-gold)] hover:text-black transition-colors px-4 py-2 font-cinema tracking-widest text-xs uppercase">
              <Plus size={16}/> Override Add
            </button>
            <button onClick={resetCounter} className="flex items-center gap-2 border border-[var(--antique-gold)] text-[var(--antique-gold)] hover:bg-[var(--antique-gold)] hover:text-black transition-all px-4 py-2 font-cinema tracking-widest text-[0.6rem] uppercase">
              <ShieldAlert size={14}/> Reset ID to 001
            </button>
            <button onClick={wipeAllData} className="flex items-center gap-2 bg-red-950/30 border border-red-900 text-red-500 hover:bg-red-900 hover:text-white transition-all px-4 py-2 font-cinema tracking-widest text-[0.6rem] uppercase">
              <Trash2 size={14}/> Wipe All (Reset DB)
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto border border-[rgba(212,175,55,0.15)] bg-[#111]">
          <table className="w-full text-left font-script text-sm">
            <thead>
              <tr className="bg-black text-[var(--antique-gold)] uppercase tracking-widest font-cinema text-xs">
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Team ID</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Team Name</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Act</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Lead Performer</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">USN / CSN</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Branch</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Stay</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Teammates</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Teammate USN</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Teammate Branch</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Teammate Stay</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Placement</th>
                <th className="p-4 border-b border-[rgba(212,175,55,0.2)] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(212,175,55,0.02)] transition-colors">
                  <td className="p-4 font-bold text-[var(--antique-gold-soft)] whitespace-nowrap">{r.teamId || "-"}</td>
                  <td className="p-4 font-bold text-[var(--ivory)] whitespace-nowrap">{r.teamName}</td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="bg-[rgba(128,0,0,0.3)] text-[var(--ivory-muted)] px-2 py-1 text-xs uppercase tracking-wider border border-[rgba(128,0,0,0.5)]">{r.act}</span>
                  </td>
                  <td className="p-4 whitespace-nowrap">{r.leadName}</td>
                  <td className="p-4 text-xs whitespace-nowrap">{r.usn}</td>
                  <td className="p-4 text-xs whitespace-nowrap">{r.branch}</td>
                  <td className="p-4 text-xs whitespace-nowrap">{r.stay === "hostel" ? r.hostelName : "Local"}</td>
                  
                  <td className="p-4 text-xs whitespace-nowrap">
                    {r.members?.length ? r.members.map((m, i) => <div key={i} className="mb-2">{m.name}</div>) : <div className="opacity-50">-</div>}
                  </td>
                  <td className="p-4 text-xs whitespace-nowrap">
                    {r.members?.length ? r.members.map((m, i) => <div key={i} className="mb-2">{m.usn}</div>) : <div className="opacity-50">-</div>}
                  </td>
                  <td className="p-4 text-xs whitespace-nowrap">
                    {r.members?.length ? r.members.map((m, i) => <div key={i} className="mb-2">{m.branch}</div>) : <div className="opacity-50">-</div>}
                  </td>
                  <td className="p-4 text-xs whitespace-nowrap">
                    {r.members?.length ? r.members.map((m, i) => <div key={i} className="mb-2">{m.stay === "hostel" ? m.hostelName : "Local"}</div>) : <div className="opacity-50">-</div>}
                  </td>
                  <td className="p-4">
                    <select 
                      value={r.placement || ""} 
                      onChange={(e) => updatePlacement(r.id, e.target.value)}
                      className={`text-xs bg-black p-1 border font-cinema ${r.placement ? 'border-[var(--antique-gold)] text-[var(--antique-gold)]' : 'border-[rgba(255,255,255,0.1)] text-gray-500'}`}
                    >
                      <option value="">Unranked</option>
                      <option value="Winner">Winner</option>
                      <option value="1st Runner Up">1st Runner Up</option>
                      <option value="2nd Runner Up">2nd Runner Up</option>
                    </select>
                  </td>
                  <td className="p-4 flex gap-3 justify-end items-center">
                    <button onClick={() => openEditModal(r)} className="text-[var(--antique-gold)] hover:text-white"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(r.id)} className="text-[var(--royal-maroon)] hover:text-red-500"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={13} className="p-8 text-center italic opacity-50">No acts found matching constraints.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Modal / Override Form */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111] border border-[var(--antique-gold)] max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-[var(--antique-gold-soft)] hover:text-white"><X size={24}/></button>
              
              <h2 className="font-cinema text-2xl text-[var(--ivory)] uppercase tracking-widest mb-6">Database Override</h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Team Name</label><input className="w-full input-royal px-3 py-2 bg-black text-white" value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} /></div>
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Act</label><input className="w-full input-royal px-3 py-2 bg-black text-white" value={formData.act} onChange={e => setFormData({...formData, act: e.target.value})} /></div>
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Lead Name</label><input className="w-full input-royal px-3 py-2 bg-black text-white" value={formData.leadName} onChange={e => setFormData({...formData, leadName: e.target.value})} /></div>
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Lead USN</label><input className="w-full input-royal px-3 py-2 bg-black text-white" value={formData.usn} onChange={e => setFormData({...formData, usn: e.target.value})} /></div>
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Branch / Semester</label><div className="flex gap-2"><input className="w-1/2 input-royal bg-black px-2 py-2" value={formData.branch} onChange={e => setFormData({...formData, branch: e.target.value})} /><input className="w-1/2 input-royal bg-black px-2 py-2" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} /></div></div>
                <div><label className="text-xs text-[var(--antique-gold-dim)] uppercase">Stay (local/hostel) / Block Name</label><div className="flex gap-2"><input className="w-1/2 input-royal bg-black px-2 py-2" value={formData.stay} onChange={e => setFormData({...formData, stay: e.target.value})} /><input className="w-1/2 input-royal bg-black px-2 py-2" value={formData.hostelName} onChange={e => setFormData({...formData, hostelName: e.target.value})} /></div></div>
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.1)] gap-4">
                <button onClick={() => setModalOpen(false)} className="px-6 py-2 border border-gray-600 text-gray-400">Cancel</button>
                <button onClick={handleModalSave} className="engraved-btn font-cinema tracking-widest px-8 py-2 text-xs">Execute Override</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Purge Instructions (Visible only to Admin) */}
      <div className="mt-12 p-8 border border-red-900/30 bg-red-950/10 max-w-lg">
        <h3 className="font-cinema text-red-500 text-sm tracking-widest uppercase mb-4">Manual Purge Guide</h3>
        <p className="font-script text-xs text-gray-400 leading-loose">
          If the "Wipe All" button fails due to security rules, follow these 3 steps in your Firebase Console: <br />
          1. Go to <span className="text-[var(--antique-gold)] underline">Firestore Database</span>. <br />
          2. Locate the <span className="text-[var(--antique-gold)] underline">registrations</span> collection. <br />
          3. Click the three dots (⋮) and select <span className="text-red-500 font-bold">Delete collection</span>. <br />
          This is the only way to bypass the restricted web-SDK delete permissions.
        </p>
      </div>

    </div>
  );
}
