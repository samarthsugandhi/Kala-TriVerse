"use client";

import { useEffect, useState, Fragment } from "react";
import { auth, db } from "@/firebase/config";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import {
  createRegistrationWithGeneratedId,
  restoreRegistration,
  softDeleteRegistration,
} from "@/firebase/registrationService";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Trash2, Edit, Download, Plus, Search, ShieldAlert, X, FileText, Minus } from "lucide-react";

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
  isDeleted?: boolean;
  deletedAt?: any;
  deletedBy?: string | null;
  createdAt: any;
  updatedAt?: any;
}

const ACT_LABELS: Record<string, string> = {
  classical: "Classical",
  western: "Western",
  folk: "Janapada",
  drama: "Drama",
  food: "Cooking",
};

const getActLabel = (act: string) => ACT_LABELS[act] || act || "-";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [awardsReleased, setAwardsReleased] = useState(false);
  
  const [filterAct, setFilterAct] = useState("");
  const [filterStatus, setFilterStatus] = useState<"active" | "deleted" | "all">("active");
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

  const handleSoftDelete = async (teamId: string) => {
    if (!confirm("Move this team to deleted state?")) return;
    await softDeleteRegistration(db, teamId, user?.email || "admin");
  };

  const handleRestore = async (teamId: string) => {
    if (!confirm("Restore this deleted team?")) return;
    await restoreRegistration(db, teamId, user?.email || "admin");
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ teamName: "", act: "", leadName: "", usn: "", email: "", phone: "", branch: "", semester: "", stay: "local", hostelName: "", members: [], isDeleted: false, deletedAt: null, deletedBy: null });
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
        const { id, createdAt, deletedAt, ...safePayload } = formData as Registration;
        await updateDoc(doc(db, "registrations", editId), {
          ...safePayload,
          updatedAt: serverTimestamp(),
        });
      } else {
        await createRegistrationWithGeneratedId(db, {
          teamName: String(formData.teamName || "").trim(),
          act: String(formData.act || "").trim(),
          leadName: String(formData.leadName || "").trim(),
          usn: String(formData.usn || "").trim().toUpperCase(),
          semester: String(formData.semester || "").trim(),
          branch: String(formData.branch || "").trim(),
          email: String(formData.email || "").trim(),
          phone: String(formData.phone || "").trim(),
          stay: String(formData.stay || "local").trim(),
          hostelName: String(formData.hostelName || "").trim(),
          members: formData.members || [],
          placement: formData.placement || "",
        }, user?.email || "admin");
      }
      setModalOpen(false);
    } catch (err) {
      alert("Error overriding dataset.");
    }
  };

  const updatePlacement = async (id: string, val: string) => {
    await updateDoc(doc(db, "registrations", id), { placement: val });
  };

  const exportCSV = () => {
    const headers = ["Team ID", "Team Name", "Act", "Lead Name", "Lead USN", "Lead Branch", "Lead Email", "Lead Phone", "Lead Stay", "Hostel/Block", "Member Count", "Member Names", "Member USNs", "Member Branches", "Member Stays", "Placement"];
    const rows = filtered.map(r => [
      r.teamId || "",
      `"${r.teamName || ""}"`,
      getActLabel(r.act),
      `"${r.leadName || ""}"`,
      r.usn || "",
      r.branch || "",
      r.email || "",
      r.phone || "",
      r.stay || "",
      r.stay === "hostel" ? (r.hostelName || "") : "Local",
      (r.members?.length || 0) + 1,
      `"${(r.members?.map(m => m.name).join("; ") || "")}"`,
      `"${(r.members?.map(m => m.usn).join("; ") || "")}"`,
      `"${(r.members?.map(m => m.branch).join("; ") || "")}"`,
      `"${(r.members?.map(m => m.stay === "hostel" ? m.hostelName : "Local").join("; ") || "")}"`,
      r.placement || "Unranked"
    ].join(","));
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KALA-Teams-Export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const pdfDoc = new jsPDF("landscape");
    pdfDoc.text("KALA-TriVerse Registration Export", 14, 15);
    pdfDoc.setFontSize(10);
    pdfDoc.text(`Exported: ${new Date().toLocaleDateString()} | Total Teams: ${filtered.length}`, 14, 22);
    
    autoTable(pdfDoc, {
      startY: 28,
      head: [["Team ID", "Team Name", "Act", "Lead Performer", "USN", "Branch", "Email", "Phone", "Stay", "Members", "Placement"]],
      body: filtered.map(r => [
        r.teamId || "-",
        r.teamName || "-",
        getActLabel(r.act),
        r.leadName || "-",
        r.usn || "-",
        r.branch || "-",
        r.email || "-",
        r.phone || "-",
        r.stay === "hostel" ? (r.hostelName || "-") : "Local",
        `Lead + ${r.members?.length || 0}`,
        r.placement || "Unranked"
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [128, 0, 0], textColor: [255, 255, 255], fontStyle: "bold" },
      margin: { top: 28 },
      didDrawPage: (data) => {
        const pageSize = pdfDoc.internal.pageSize;
        const pageHeight = pageSize.getHeight();
        const pageWidth = pageSize.getWidth();
        pdfDoc.setFontSize(8);
        pdfDoc.text(`Page ${data.pageNumber}`, pageWidth - 20, pageHeight - 10);
      }
    });
    pdfDoc.save(`KALA-Teams-Export-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const filtered = registrations.filter(r => {
    const isDeleted = !!r.isDeleted;
    const matchStatus = filterStatus === "all"
      ? true
      : filterStatus === "deleted"
      ? isDeleted
      : !isDeleted;

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
    return matchStatus && matchAct && matchSearch;
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
              <option value="food">Cooking</option>
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as "active" | "deleted" | "all")} className="input-royal px-4 py-2 text-sm bg-[#111]">
              <option value="active">Active Teams</option>
              <option value="deleted">Deleted Teams</option>
              <option value="all">All Teams</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <button onClick={openAddModal} className="flex items-center gap-2 bg-[rgba(212,175,55,0.1)] border border-[var(--antique-gold-soft)] text-[var(--ivory)] hover:bg-[var(--antique-gold)] hover:text-black transition-colors px-4 py-2 font-cinema tracking-widest text-xs uppercase">
              <Plus size={16}/> Override Add
            </button>
            <button onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2 bg-blue-900/20 border border-blue-600 text-blue-300 hover:bg-blue-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 font-cinema tracking-widest text-xs uppercase">
              <Download size={16}/> Export CSV
            </button>
            <button onClick={exportPDF} disabled={filtered.length === 0} className="flex items-center gap-2 bg-red-900/20 border border-red-600 text-red-300 hover:bg-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 font-cinema tracking-widest text-xs uppercase">
              <FileText size={16}/> Export PDF
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="border border-[rgba(212,175,55,0.15)] bg-[#111]">
          <div className="bg-black px-4 py-3 border-b border-[rgba(212,175,55,0.2)] flex justify-between items-center">
            <p className="font-cinema text-xs uppercase tracking-widest text-[var(--antique-gold-soft)]">
              Results: <span className="text-[var(--ivory)]">{filtered.length}</span> team{filtered.length !== 1 ? "s" : ""}
              {filterAct && ` (${filterAct})`}
              {filterStatus === "deleted" && " [DELETED]"}
              {searchTerm && ` / Search: "${searchTerm}"`}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-script text-sm">
            <thead>
              <tr className="bg-black text-[var(--antique-gold)] uppercase tracking-widest font-cinema text-xs">
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Team ID</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Team Name</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">ACT - (Classical, Western, Janapada, Drama, Cooking)</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Lead Performer</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">USN / CSN</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Gmail</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Phone</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Branch</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Stay</th>
                {/* Dynamic teammate headers */}
                {Array.from({ length: Math.max(...filtered.map(r => r.members?.length || 0), 0) }).map((_, idx) => (
                  <Fragment key={`teammate-${idx}`}>
                    <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Teammate-{idx + 1} Name</th>
                    <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">USN</th>
                    <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Branch</th>
                    <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Stay</th>
                  </Fragment>
                ))}
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] whitespace-nowrap">Placement</th>
                <th className="p-3 border-b border-[rgba(212,175,55,0.2)] text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const maxMembers = Math.max(...filtered.map(reg => reg.members?.length || 0), 0);
                return (
                  <tr key={r.id} className={`border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(212,175,55,0.02)] transition-colors ${r.isDeleted ? "opacity-60 bg-[rgba(128,0,0,0.08)]" : ""}`}>
                    <td className="p-3 font-bold text-[var(--antique-gold-soft)] whitespace-nowrap">{r.teamId || "-"}</td>
                    <td className="p-3 font-bold text-[var(--ivory)] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{r.teamName}</span>
                      {r.isDeleted && <span className="text-[10px] uppercase tracking-wider px-2 py-1 border border-red-500 text-red-400">Deleted</span>}
                    </div>
                  </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="bg-[rgba(128,0,0,0.3)] text-[var(--ivory-muted)] px-2 py-1 text-xs uppercase tracking-wider border border-[rgba(128,0,0,0.5)]">{getActLabel(r.act)}</span>
                    </td>
                    <td className="p-3 whitespace-nowrap text-xs">{r.leadName}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.usn}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.email}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.phone}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.branch}</td>
                    <td className="p-3 text-xs whitespace-nowrap">{r.stay === "hostel" ? r.hostelName : "Local"}</td>
                    
                    {/* Dynamic teammate columns */}
                    {Array.from({ length: maxMembers }).map((_, memberIdx) => {
                      const member = r.members?.[memberIdx];
                      return (
                          <Fragment key={`member-${memberIdx}`}>
                          <td className="p-3 text-xs whitespace-nowrap">{member?.name || "-"}</td>
                          <td className="p-3 text-xs whitespace-nowrap">{member?.usn || "-"}</td>
                          <td className="p-3 text-xs whitespace-nowrap">{member?.branch || "-"}</td>
                          <td className="p-3 text-xs whitespace-nowrap">{member ? (member.stay === "hostel" ? member.hostelName : "Local") : "-"}</td>
                          </Fragment>
                      );
                    })}
                    
                    <td className="p-3">
                    <select 
                      value={r.placement || ""} 
                      onChange={(e) => updatePlacement(r.id, e.target.value)}
                      disabled={!!r.isDeleted}
                      className={`text-xs bg-black p-1 border font-cinema ${r.placement ? 'border-[var(--antique-gold)] text-[var(--antique-gold)]' : 'border-[rgba(255,255,255,0.1)] text-gray-500'}`}
                    >
                      <option value="">Unranked</option>
                      <option value="Winner">Winner</option>
                      <option value="1st Runner Up">1st Runner Up</option>
                      <option value="2nd Runner Up">2nd Runner Up</option>
                    </select>
                    </td>
                    <td className="p-3 flex gap-3 justify-end items-center">
                    {!r.isDeleted ? (
                      <>
                        <button onClick={() => openEditModal(r)} className="text-[var(--antique-gold)] hover:text-white"><Edit size={16}/></button>
                        <button onClick={() => handleSoftDelete(r.id)} className="text-[var(--royal-maroon)] hover:text-red-500" title="Soft Delete"><Trash2 size={16}/></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleRestore(r.id)} className="text-green-400 hover:text-green-300 text-xs uppercase tracking-widest font-cinema">Restore</button>
                      </>
                    )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={20} className="p-8 text-center italic opacity-50">No acts found matching constraints.</td>
                </tr>
              )}
            </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal / Override Form */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111] border border-[var(--antique-gold)] max-w-4xl w-full my-8 p-8 relative shadow-2xl">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-[var(--antique-gold-soft)] hover:text-white"><X size={24}/></button>
              
              <h2 className="font-cinema text-2xl text-[var(--ivory)] uppercase tracking-widest mb-2">{editId ? "Edit Team" : "Add New Team"}</h2>
              <p className="text-xs font-cinema tracking-widest text-[var(--antique-gold-soft)] mb-6 uppercase">
                {editId ? `Team ID (Immutable): ${formData.teamId || editId}` : `Team ID will be auto-generated (Sequential & Never Reused)`}
              </p>

              {/* Team Details Section */}
              <div className="mb-6 pb-6 border-b border-[rgba(212,175,55,0.2)]">
                <h3 className="text-sm font-cinema uppercase tracking-widest text-[var(--antique-gold)] mb-4">Team Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Team Name *</label>
                    <input 
                      type="text"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.teamName} 
                      onChange={e => setFormData({...formData, teamName: e.target.value})} 
                      placeholder="e.g., Phoenix Rising"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Act *</label>
                    <select 
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.act} 
                      onChange={e => setFormData({...formData, act: e.target.value})}
                    >
                      <option value="">Select Act</option>
                      <option value="classical">Classical Dance</option>
                      <option value="western">Western Dance</option>
                      <option value="folk">Janapada Folk</option>
                      <option value="drama">Drama / Skit</option>
                      <option value="food">Cooking</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Lead Performer Section */}
              <div className="mb-6 pb-6 border-b border-[rgba(212,175,55,0.2)]">
                <h3 className="text-sm font-cinema uppercase tracking-widest text-[var(--antique-gold)] mb-4">Lead Performer Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Lead Name *</label>
                    <input 
                      type="text"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.leadName} 
                      onChange={e => setFormData({...formData, leadName: e.target.value})}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">USN / CSN *</label>
                    <input 
                      type="text"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.usn} 
                      onChange={e => setFormData({...formData, usn: e.target.value.toUpperCase()})}
                      placeholder="e.g., 2BA23IS001"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Semester *</label>
                    <select 
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.semester} 
                      onChange={e => setFormData({...formData, semester: e.target.value})}
                    >
                      <option value="">Select Semester</option>
                      <option value="1">1st</option>
                      <option value="2">2nd</option>
                      <option value="3">3rd</option>
                      <option value="4">4th</option>
                      <option value="5">5th</option>
                      <option value="6">6th</option>
                      <option value="7">7th</option>
                      <option value="8">8th</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Branch *</label>
                    <input 
                      type="text"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.branch} 
                      onChange={e => setFormData({...formData, branch: e.target.value})}
                      placeholder="e.g., ISE"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Email *</label>
                    <input 
                      type="email"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="name@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Phone *</label>
                    <input 
                      type="tel"
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      placeholder="10-digit number"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Stay *</label>
                    <select 
                      className="w-full input-royal px-3 py-2 bg-black text-white" 
                      value={formData.stay} 
                      onChange={e => setFormData({...formData, stay: e.target.value})}
                    >
                      <option value="local">Local</option>
                      <option value="hostel">Hostel</option>
                    </select>
                  </div>
                  {formData.stay === "hostel" && (
                    <div>
                      <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Hostel Name *</label>
                      <select 
                        className="w-full input-royal px-3 py-2 bg-black text-white" 
                        value={formData.hostelName} 
                        onChange={e => setFormData({...formData, hostelName: e.target.value})}
                      >
                        <option value="">Select Hostel</option>
                        <option value="Girls Hostel">Girls Hostel</option>
                        <option value="V-Block Hostel">V-Block Hostel</option>
                        <option value="N-Block Hostel">N-Block Hostel</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Teammates Section */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-cinema uppercase tracking-widest text-[var(--antique-gold)]">Teammates (Optional)</h3>
                  <button 
                    onClick={() => setFormData({
                      ...formData, 
                      members: [...(formData.members || []), { name: "", usn: "", semester: "", branch: "", email: "", phone: "", stay: "local", hostelName: "" }]
                    })}
                    className="flex items-center gap-1 text-xs bg-[rgba(212,175,55,0.1)] border border-[var(--antique-gold-soft)] text-[var(--ivory)] hover:bg-[var(--antique-gold)] hover:text-black transition-colors px-3 py-1 font-cinema tracking-widest uppercase"
                  >
                    <Plus size={14}/> Add Teammate
                  </button>
                </div>

                {(formData.members || []).map((member, idx) => (
                  <div key={idx} className="mb-6 pb-6 border-b border-[rgba(212,175,55,0.15)] last:border-0">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-cinema uppercase tracking-widest text-[var(--antique-gold-soft)]">Teammate {idx + 1}</h4>
                      <button 
                        onClick={() => setFormData({...formData, members: formData.members?.filter((_, i) => i !== idx)})}
                        className="text-[var(--royal-maroon)] hover:text-red-500"
                      >
                        <Minus size={14}/>
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Name *</label>
                        <input 
                          type="text"
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.name} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].name = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                          placeholder="Full name"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">USN / CSN *</label>
                        <input 
                          type="text"
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.usn} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].usn = e.target.value.toUpperCase();
                            setFormData({...formData, members: newMembers});
                          }}
                          placeholder="e.g., 2BA23IS001"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Semester *</label>
                        <select 
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.semester} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].semester = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                        >
                          <option value="">Select Semester</option>
                          <option value="1">1st</option>
                          <option value="2">2nd</option>
                          <option value="3">3rd</option>
                          <option value="4">4th</option>
                          <option value="5">5th</option>
                          <option value="6">6th</option>
                          <option value="7">7th</option>
                          <option value="8">8th</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Branch *</label>
                        <input 
                          type="text"
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.branch} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].branch = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                          placeholder="e.g., ISE"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Email *</label>
                        <input 
                          type="email"
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.email} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].email = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                          placeholder="name@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Phone *</label>
                        <input 
                          type="tel"
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.phone} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].phone = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                          placeholder="10-digit number"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Stay *</label>
                        <select 
                          className="w-full input-royal px-3 py-2 bg-black text-white" 
                          value={member.stay} 
                          onChange={e => {
                            const newMembers = [...(formData.members || [])];
                            newMembers[idx].stay = e.target.value;
                            setFormData({...formData, members: newMembers});
                          }}
                        >
                          <option value="local">Local</option>
                          <option value="hostel">Hostel</option>
                        </select>
                      </div>
                      {member.stay === "hostel" && (
                        <div>
                          <label className="text-xs text-[var(--antique-gold-dim)] uppercase">Hostel Name *</label>
                          <select 
                            className="w-full input-royal px-3 py-2 bg-black text-white" 
                            value={member.hostelName} 
                            onChange={e => {
                              const newMembers = [...(formData.members || [])];
                              newMembers[idx].hostelName = e.target.value;
                              setFormData({...formData, members: newMembers});
                            }}
                          >
                            <option value="">Select Hostel</option>
                            <option value="Girls Hostel">Girls Hostel</option>
                            <option value="V-Block Hostel">V-Block Hostel</option>
                            <option value="N-Block Hostel">N-Block Hostel</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.1)] gap-4">
                <button onClick={() => setModalOpen(false)} className="px-6 py-2 border border-gray-600 text-gray-400 hover:bg-gray-900">Cancel</button>
                <button onClick={handleModalSave} className="engraved-btn font-cinema tracking-widest px-8 py-2 text-xs">{editId ? "Update Team" : "Create Team"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
