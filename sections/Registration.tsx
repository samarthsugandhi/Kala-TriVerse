"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { onSnapshot, doc } from "firebase/firestore";
import { createRegistrationWithGeneratedId } from "@/firebase/registrationService";
import { Plus, Minus, Lock } from "lucide-react";

const EVENT_OPTIONS = [
  { value: "", label: "Select Act" },
  { value: "classical", label: "Act I: Classical Dance" },
  { value: "western", label: "Act II: Western Dance" },
  { value: "folk", label: "Act III: Janapada Folk" },
  { value: "drama", label: "Act IV: Drama / Skit" },
  { value: "food", label: "Act V: Cooking" },
];

const SEMESTER_OPTIONS = [
  { value: "", label: "Select Semester" },
  { value: "1", label: "1st Semester" },
  { value: "2", label: "2nd Semester" },
  { value: "3", label: "3rd Semester" },
  { value: "4", label: "4th Semester" },
  { value: "5", label: "5th Semester" },
  { value: "6", label: "6th Semester" },
  { value: "7", label: "7th Semester" },
  { value: "8", label: "8th Semester" },
];

const HOSTELS = ["Girls Hostel", "V-Block Hostel", "N-Block Hostel"];

interface Member {
  name: string;
  usn: string;
  semester: string;
  branch: string;
  email: string;
  phone: string;
  stay: string;
  hostelName: string;
  otherBranch?: string;
}

export default function Registration() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (d) => {
      if (d.exists()) {
        setIsOpen(d.data().isRegistrationOpen ?? true);
      } else {
        setIsOpen(true);
      }
    });
    return () => unsub();
  }, []);



  const [form, setForm] = useState({
    teamName: "",
    act: "",
    leadName: "",
    usn: "",
    semester: "",
    branch: "",
    email: "",
    phone: "",
    stay: "local", // local or hostel
    hostelName: "", // if stay == hostel
    otherBranch: "",
    members: [] as Member[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationNotice, setValidationNotice] = useState("");
  const [showValidationNotice, setShowValidationNotice] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [successTeamId, setSuccessTeamId] = useState("");
  const [successInfo, setSuccessInfo] = useState<{ id: string, name: string, act: string, date: string } | null>(null);

  const downloadPass = (info?: { id: string, name: string, act: string, date: string }) => {
    const data = info || successInfo;
    if (!data) return;
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#0a0a0a"; // Solid dark charcoal
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = "#D4AF37"; // var(--antique-gold)
    ctx.font = "bold 44px 'Times New Roman', serif";
    ctx.fillText("KALA-TRIVERSE : FUSION FEST", 40, 80);

    // Subtitle
    ctx.fillStyle = "#e0e0e0";
    ctx.font = "24px 'Times New Roman', serif";
    ctx.fillText("EVENT PASS", 40, 130);

    // Divider
    ctx.fillStyle = "rgba(212,175,55,0.4)";
    ctx.fillRect(40, 160, canvas.width - 80, 1);

    // Team info
    ctx.fillStyle = "#b0b0b0";
    ctx.font = "24px 'Times New Roman', serif";
    ctx.fillText(`Team: `, 40, 220);
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText(data.name, 120, 220);

    // Event Name
    ctx.fillStyle = "#b0b0b0";
    ctx.fillText(`Event: `, 40, 260);
    ctx.fillStyle = "#e0e0e0";
    ctx.fillText(data.act, 120, 260);

    // Registration ID
    ctx.fillStyle = "#b0b0b0";
    ctx.fillText(`Registration ID: `, 40, 300);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px 'Times New Roman', serif";
    ctx.fillText(data.id, 210, 300);

    // Note
    ctx.fillStyle = "#888888";
    ctx.font = "20px 'Times New Roman', serif";
    ctx.fillText("Carry this pass (Registration ID) at event entry.", 40, 360);

    // Date
    ctx.fillStyle = "#666666";
    ctx.font = "italic 20px 'Times New Roman', serif";
    ctx.fillText(data.date, 40, 410);

    // KALA Watermark on the right side
    ctx.fillStyle = "rgba(212, 175, 55, 0.05)";
    ctx.font = "bold 160px 'Times New Roman', serif";
    ctx.fillText("KALA", 450, 280);

    const link = document.createElement("a");
    link.download = `${data.id}-Event-Pass.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const usnRegex = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/i; // E.g. 2BA23IS001

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      teamName: "Team Name",
      act: "The Act",
      leadName: "Lead Name",
      usn: "Lead USN / CSN",
      semester: "Lead Semester",
      branch: "Lead Branch",
      otherBranch: "Lead Branch (Others)",
      email: "Lead Gmail ID",
      phone: "Lead Phone Number",
      hostelName: "Lead Hostel",
    };

    if (labels[key]) return labels[key];

    const memberFieldMatch = key.match(/^member_(\d+)_(.+)$/);
    if (!memberFieldMatch) return key;

    const memberIndex = Number(memberFieldMatch[1]) + 1;
    const memberField = memberFieldMatch[2];
    const memberLabels: Record<string, string> = {
      name: "Name",
      usn: "USN / CSN",
      semester: "Semester",
      branch: "Branch",
      otherBranch: "Branch (Others)",
      email: "Gmail ID",
      phone: "Phone Number",
      hostelName: "Hostel",
    };

    return `Teammate ${memberIndex} ${memberLabels[memberField] || memberField}`;
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.teamName.trim()) e.teamName = "Team name required";
    if (!form.act) e.act = "Please select an act";
    if (!form.leadName.trim()) e.leadName = "Lead name required";

    if (!form.usn.trim()) e.usn = "USN / CSN is required";
    else if (!usnRegex.test(form.usn.trim())) e.usn = "Invalid USN format (e.g. 2BA23IS001)";
    if (!form.semester) e.semester = "Select a semester";
    if (!form.branch.trim()) e.branch = "Branch is required";
    if (form.branch === "Others" && !form.otherBranch.trim()) e.otherBranch = "Please specify branch";
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10-digit number required";
    
    if (form.stay === "hostel" && !form.hostelName) {
      e.hostelName = "Please select your hostel";
    }

    form.members.forEach((m, idx) => {
      if (!m.name.trim()) e[`member_${idx}_name`] = "Required";
      if (!m.usn.trim()) e[`member_${idx}_usn`] = "Required";
      else if (!usnRegex.test(m.usn.trim())) e[`member_${idx}_usn`] = "Invalid USN";
      if (!m.semester) e[`member_${idx}_semester`] = "Required";
      if (!m.branch.trim()) e[`member_${idx}_branch`] = "Required";
      if (m.branch === "Others" && !m.otherBranch?.trim()) e[`member_${idx}_otherBranch`] = "Required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m.email)) e[`member_${idx}_email`] = "Invalid email";
      if (!/^\d{10}$/.test(m.phone)) e[`member_${idx}_phone`] = "10 digits";
      if (m.stay === "hostel" && !m.hostelName) {
        e[`member_${idx}_hostelName`] = "Required";
      }
    });

    return e;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...form.members];
    newMembers[index][field] = value;
    setForm(prev => ({ ...prev, members: newMembers }));
    if (errors[`member_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`member_${index}_${field}`]: "" }));
    }
  };

  const addMember = () => {
    setForm(prev => ({ ...prev, members: [...prev.members, { 
      name: "", usn: "", semester: "", branch: "", otherBranch: "", email: "", phone: "", stay: "local", hostelName: "" 
    }] }));
  };

  const removeMember = (index: number) => {
    const newMembers = form.members.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstMissingKey = Object.keys(errs).find((key) => {
        const msg = errs[key].toLowerCase();
        return msg.includes("required") || msg.includes("select");
      });
      if (firstMissingKey) {
        setValidationNotice(`You have not filled this field: ${getFieldLabel(firstMissingKey)}.`);
        setShowValidationNotice(true);
      }
      return;
    }
    setStatus("loading");
    try {
      const eventDetails = EVENT_OPTIONS.find(o => o.value === form.act)?.label || form.act;
      let eventDate = "22nd April 2026";

      const finalForm = { ...form };
      finalForm.usn = finalForm.usn.trim().toUpperCase();
      finalForm.phone = finalForm.phone.trim();
      finalForm.email = finalForm.email.trim();
      if (finalForm.branch === "Others") finalForm.branch = finalForm.otherBranch;
      delete (finalForm as any).otherBranch;
      finalForm.members = finalForm.members.map(m => {
        const newM = { ...m };
        newM.usn = newM.usn.trim().toUpperCase();
        newM.phone = newM.phone.trim();
        newM.email = newM.email.trim();
        if (newM.branch === "Others") newM.branch = newM.otherBranch || "Others";
        delete newM.otherBranch;
        return newM;
      });

      const generatedId = await createRegistrationWithGeneratedId(db, finalForm, "public");

      const info = { id: generatedId, name: form.teamName, act: eventDetails, date: eventDate };
      setSuccessTeamId(generatedId);
      setSuccessInfo(info);
      setStatus("success");
      setForm({ teamName: "", act: "", leadName: "", usn: "", semester: "", branch: "", otherBranch: "", email: "", phone: "", stay: "local", hostelName: "", members: [] });
      
      // Auto-download logic
      setTimeout(() => downloadPass(info), 500);
    } catch (err) {
      console.error("Submission error:", err);
      const errorCode = (err as any)?.code || "";
      if (errorCode === "permission-denied" || errorCode === "unavailable" || errorCode === "deadline-exceeded") {
        setValidationNotice("Registration could not reach the database. Please try another network or disable VPN/ad-blocking, then submit again.");
        setShowValidationNotice(true);
      }
      setStatus("error");
    }
  };

  return (
    <section id="register" className="section-shell relative flex justify-center">
      <div className="absolute inset-x-0 w-full h-[1px] top-0 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.2)] to-transparent" />

      <div className="max-w-4xl w-full relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="section-title text-4xl md:text-5xl mb-4"
          >
            Claim Your Spot
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="section-copy font-script italic text-sm tracking-wide"
          >
            Register your team for the grand stage.
          </motion.p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 50 }}
           animate={inView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
           className="relative"
        >
           {/* Minimal Royal Shadow Frame */}
           <div className="absolute -inset-1 bg-[var(--antique-gold-soft)] opacity-20 blur-2xl pointer-events-none hidden md:block" />
           
           <div className="premium-card rounded-[2rem] p-6 md:p-14 relative z-10 overflow-hidden min-h-[400px] flex flex-col justify-center">
              {isOpen === false ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-20 px-4">
                  <Lock size={48} strokeWidth={1} className="text-[var(--antique-gold-dim)] mb-6" />
                  <h3 className="font-cinema text-3xl text-[var(--ivory)] uppercase tracking-widest mb-4">
                    The Script is Closed
                  </h3>
                  <p className="font-script text-[var(--ivory-muted)] leading-loose max-w-lg">
                    Registrations for KALA-TriVerse have officially concluded. Only the finalized cast remains. Thank you for your overwhelming response.
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col items-center text-center py-10"
                  >
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="text-[var(--antique-gold)] text-6xl mb-6"
                    >
                      🎭
                    </motion.div>
                    <h3 className="font-cinema text-3xl text-[var(--ivory)] uppercase tracking-widest mb-4">
                      The Stage is Set
                    </h3>
                    <p className="font-script text-[var(--ivory-muted)] mb-6 leading-loose">
                      Your team's script has been recorded. <br/>
                      Team ID: <span className="font-cinema text-[var(--antique-gold)] text-xl ml-2 tracking-widest">{successTeamId}</span>
                    </p>

                    <a href="https://chat.whatsapp.com/FF5tduDBfQxLtcuz4z69Rk?mode=gi_t" target="_blank" rel="noopener noreferrer" className="font-script text-blue-400 hover:text-blue-300 underline mb-8 block transition-colors tracking-wide text-sm">
                      Join our WhatsApp Group for Updates
                    </a>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => downloadPass()}
                        className="bg-[var(--antique-gold)] text-black font-cinema tracking-widest uppercase px-8 py-3 text-xs hover:bg-[var(--ivory)] transition-colors rounded-full"
                      >
                        Download Event Pass
                      </button>
                      <button
                        onClick={() => setStatus("idle")}
                        className="engraved-btn font-cinema tracking-widest uppercase px-8 py-3 text-xs rounded-full"
                      >
                        Register Another Act
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-10"
                  >
                    {/* Fee Details Box */}
                    <div className="premium-card-soft rounded-2xl border-[1.5px] border-[var(--antique-gold)] p-6 text-center space-y-4 shadow-[0_0_20px_rgba(212,175,55,0.15)] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-600 via-[var(--antique-gold)] to-red-600 opacity-80" />
                      
                      <h4 className="font-cinema text-[var(--antique-gold)] text-xl uppercase tracking-widest">Registration Fees</h4>
                      <p className="font-script text-[var(--ivory)] text-xl">Individual – ₹100 <span className="mx-4 text-[var(--antique-gold-soft)]">|</span> Team – ₹250</p>
                      
                      <div className="mt-6 p-4 sm:p-5 bg-red-950/60 border border-red-500 rounded text-left inline-block relative overflow-hidden shadow-lg w-full max-w-2xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-red-500 animate-pulse" />
                        
                        <p className="font-script text-red-50 text-base leading-relaxed pl-3 relative z-10">
                          <span className="text-red-400 font-bold uppercase tracking-widest block mb-2 sm:mb-1 text-sm tracking-[0.2em] font-cinema">Critical Notice</span>
                          Please complete your registration form here. <br className="hidden sm:block" />
                          <span className="text-white font-bold bg-red-600 px-2 py-0.5 rounded mr-1 inline-block uppercase tracking-wider my-1 shadow-[0_0_10px_rgba(220,38,38,0.6)]">Offline Payment Only</span>
                           The registration fee will be collected in person on the day of the event.
                        </p>
                      </div>
                    </div>

                    {/* SECTION: Act Details */}
                    <div>
                      <h4 className="font-cinema text-[var(--antique-gold)] text-lg border-b border-[rgba(212,175,55,0.2)] pb-2 mb-6 uppercase tracking-wider">I. The Performance</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Team Name</label>
                          <input name="teamName" value={form.teamName} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Your Troupe/Team Name" />
                          {errors.teamName && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.teamName}</p>}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">The Act</label>
                          <select name="act" value={form.act} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer">
                            {EVENT_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#1A1A1A]">{o.label}</option>)}
                          </select>
                          {errors.act && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.act}</p>}
                          {form.act === "food" && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[var(--antique-gold)] text-[0.6rem] mt-2 font-script italic tracking-wider">
                              * Act V - Cooking is limited to a maximum of 2 participants (Lead + 1 Teammate).
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SECTION: Team Lead Details */}
                    <div>
                      <h4 className="font-cinema text-[var(--antique-gold)] text-lg border-b border-[rgba(212,175,55,0.2)] pb-2 mb-6 uppercase tracking-wider">II. Lead Performer</h4>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Lead Name</label>
                          <input name="leadName" value={form.leadName} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Full Name" />
                          {errors.leadName && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.leadName}</p>}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Lead USN / CSN</label>
                          <input name="usn" value={form.usn} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="e.g. 2BA23IS001" />
                          {errors.usn && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.usn}</p>}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Semester</label>
                          <select name="semester" value={form.semester} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer">
                            {SEMESTER_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#1A1A1A]">{o.label}</option>)}
                          </select>
                          {errors.semester && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.semester}</p>}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Branch</label>
                          <select name="branch" value={form.branch} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer">
                            {["Select Branch", "CSE", "ISE", "ECE", "EEE", "MECH", "CIVIL", "ECS", "AIML", "BT", "AU", "MCA", "Others"].map((b, i) => <option key={i} value={b === "Select Branch" ? "" : b} className="bg-[#1A1A1A]">{b}</option>)}
                          </select>
                          {errors.branch && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.branch}</p>}
                          {form.branch === "Others" && (
                            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                              <input name="otherBranch" value={form.otherBranch} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Specify Your Branch" />
                              {errors.otherBranch && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.otherBranch}</p>}
                            </motion.div>
                          )}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Gmail ID</label>
                          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="contact@domain.com" />
                          {errors.email && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.email}</p>}
                        </div>
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Phone Number</label>
                          <input name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="10 Digits" />
                          {errors.phone && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* Accommodation */}
                      <div className="grid md:grid-cols-2 gap-6 bg-[rgba(212,175,55,0.03)] border border-[rgba(212,175,55,0.1)] p-4 md:p-6 mb-6">
                        <div>
                          <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Accommodation</label>
                          <select name="stay" value={form.stay} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer border-none bg-[rgba(0,0,0,0.3)]">
                            <option value="local" className="bg-[#1A1A1A]">Local (Day Scholar)</option>
                            <option value="hostel" className="bg-[#1A1A1A]">Hostelite</option>
                          </select>
                        </div>
                        {form.stay === "hostel" && (
                          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                            <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Select Hostel</label>
                            <select name="hostelName" value={form.hostelName} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer border-none bg-[rgba(0,0,0,0.3)]">
                              <option value="" className="bg-[#1A1A1A]">Choose Block...</option>
                              {HOSTELS.map(h => <option key={h} value={h} className="bg-[#1A1A1A]">{h}</option>)}
                            </select>
                            {errors.hostelName && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.hostelName}</p>}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* SECTION: Team Members List */}
                    <div>
                      <h4 className="font-cinema text-[var(--antique-gold)] text-lg border-b border-[rgba(212,175,55,0.2)] pb-2 mb-6 uppercase tracking-wider">III. Teammates</h4>

                      <AnimatePresence>
                        {form.members.map((member, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#0A0A0A] border border-[rgba(212,175,55,0.1)] p-4 md:p-6 mb-8 relative"
                          >
                            <div className="flex justify-between items-center mb-6">
                              <span className="font-cinema text-[var(--antique-gold-dim)] text-sm tracking-widest uppercase">Teammate {idx + 1}</span>
                              <button type="button" onClick={() => removeMember(idx)} className="text-[var(--royal-maroon)] hover:text-red-500 transition-colors flex items-center gap-1 font-script text-xs italic">
                                <Minus size={14}/> Remove
                              </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                              <div>
                                <input value={member.name} onChange={(e) => handleMemberChange(idx, 'name', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Member Name" />
                                {errors[`member_${idx}_name`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_name`]}</p>}
                              </div>
                              <div>
                                <input value={member.usn} onChange={(e) => handleMemberChange(idx, 'usn', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Member USN" />
                                {errors[`member_${idx}_usn`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_usn`]}</p>}
                              </div>
                              <div>
                                <select value={member.semester} onChange={(e) => handleMemberChange(idx, 'semester', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer">
                                  {SEMESTER_OPTIONS.map((o) => <option key={o.value} value={o.value} className="bg-[#1A1A1A]">{o.label}</option>)}
                                </select>
                                {errors[`member_${idx}_semester`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_semester`]}</p>}
                              </div>
                              <div>
                                <select value={member.branch} onChange={(e) => handleMemberChange(idx, 'branch', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer">
                                  {["Select Branch", "CSE", "ISE", "ECE", "EEE", "MECH", "CIVIL", "ECS", "AIML", "BT", "AU", "MCA", "Others"].map((b, i) => <option key={i} value={b === "Select Branch" ? "" : b} className="bg-[#1A1A1A]">{b}</option>)}
                                </select>
                                {errors[`member_${idx}_branch`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_branch`]}</p>}
                                {member.branch === "Others" && (
                                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                                    <input value={member.otherBranch || ""} onChange={(e) => handleMemberChange(idx, 'otherBranch', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Specify Branch" />
                                    {errors[`member_${idx}_otherBranch`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_otherBranch`]}</p>}
                                  </motion.div>
                                )}
                              </div>
                              <div>
                                <input type="email" value={member.email} onChange={(e) => handleMemberChange(idx, 'email', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Gmail ID" />
                                {errors[`member_${idx}_email`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_email`]}</p>}
                              </div>
                              <div>
                                <input type="tel" value={member.phone} onChange={(e) => handleMemberChange(idx, 'phone', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Phone Number" />
                                {errors[`member_${idx}_phone`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_phone`]}</p>}
                              </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 bg-[#0F0F0F] p-4">
                              <div>
                                <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Accommodation</label>
                                <select value={member.stay} onChange={(e) => handleMemberChange(idx, 'stay', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer border-none bg-transparent">
                                  <option value="local" className="bg-[#1A1A1A]">Local (Day Scholar)</option>
                                  <option value="hostel" className="bg-[#1A1A1A]">Hostelite</option>
                                </select>
                              </div>
                              {member.stay === "hostel" && (
                                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                  <label className="font-cinema text-[0.6rem] text-[var(--antique-gold-soft)] tracking-[0.2em] uppercase mb-2 block">Select Hostel</label>
                                  <select value={member.hostelName} onChange={(e) => handleMemberChange(idx, 'hostelName', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm appearance-none cursor-pointer border-none bg-transparent">
                                    <option value="" className="bg-[#1A1A1A]">Choose Block...</option>
                                    {HOSTELS.map(h => <option key={h} value={h} className="bg-[#1A1A1A]">{h}</option>)}
                                  </select>
                                  {errors[`member_${idx}_hostelName`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_hostelName`]}</p>}
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      {form.members.length === 0 && (
                        <p className="text-[var(--ivory-dim)] font-script italic text-sm opacity-50 text-center py-4 border border-dashed border-[rgba(212,175,55,0.2)] mb-4">No additional members added. (Solo Act)</p>
                      )}
                      
                      {(form.act !== "food" || form.members.length < 1) ? (
                        <button type="button" onClick={addMember} className="flex mx-auto items-center gap-2 font-script italic text-sm text-[var(--antique-gold)] hover:text-[var(--ivory)] transition-colors border border-[rgba(212,175,55,0.4)] px-6 py-3 bg-[rgba(212,175,55,0.05)] mt-4">
                          <Plus size={16}/> <span>Add Teammate</span>
                        </button>
                      ) : (
                        <p className="text-center text-[var(--antique-gold-dim)] font-script italic text-xs mt-6 opacity-60">
                          Maximum team size reached for Act V.
                        </p>
                      )}
                    </div>

                    {status === "error" && (
                      <div className="bg-[rgba(128,0,0,0.1)] border border-[var(--royal-maroon)] p-4 text-center text-[var(--ivory-muted)] font-script text-sm">
                        Submission failed. The script could not be delivered. Please gently check all required fields above.
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="engraved-btn font-cinema tracking-widest uppercase w-full py-5 mt-4 disabled:opacity-50 text-base"
                    >
                      {status === "loading" ? "Recording Act..." : "Confirm Role"}
                    </button>
                  </motion.form>
                )}
                </AnimatePresence>
              )}
           </div>
        </motion.div>

        <AnimatePresence>
          {showValidationNotice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="w-full max-w-md bg-[#121212] border border-[rgba(212,175,55,0.25)] p-6 text-center shadow-2xl"
              >
                <p className="font-script text-[var(--ivory)] text-base leading-relaxed mb-6">
                  {validationNotice}
                </p>
                <button
                  type="button"
                  onClick={() => setShowValidationNotice(false)}
                  className="engraved-btn font-cinema tracking-widest uppercase px-8 py-3 text-xs"
                >
                  Got It
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
