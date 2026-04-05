"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { db } from "@/firebase/config";
import { onSnapshot, doc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { Plus, Minus, Lock } from "lucide-react";

const EVENT_OPTIONS = [
  { value: "", label: "Select Act" },
  { value: "classical", label: "Act I: Classical Dance" },
  { value: "western", label: "Act II: Western Dance" },
  { value: "folk", label: "Act III: Janapada Folk" },
  { value: "drama", label: "Act IV: Drama / Skit" },
  { value: "food", label: "Act V: Culinary Art (Paka)" },
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
    members: [] as Member[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const usnRegex = /^[1-4][A-Z]{2}\d{2}[A-Z]{2}\d{3}$/i; // E.g. 2BA23IS001

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.teamName.trim()) e.teamName = "Team name required";
    if (!form.act) e.act = "Please select an act";
    if (!form.leadName.trim()) e.leadName = "Lead name required";
    
    if (!usnRegex.test(form.usn)) e.usn = "Invalid USN format (e.g. 2BA23IS001)";
    if (!form.semester) e.semester = "Select a semester";
    if (!form.branch.trim()) e.branch = "Branch is required";
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^\d{10}$/.test(form.phone)) e.phone = "10-digit number required";
    
    if (form.stay === "hostel" && !form.hostelName) {
      e.hostelName = "Please select your hostel";
    }

    form.members.forEach((m, idx) => {
      if (!m.name.trim()) e[`member_${idx}_name`] = "Required";
      if (!usnRegex.test(m.usn)) e[`member_${idx}_usn`] = "Invalid USN";
      if (!m.semester) e[`member_${idx}_semester`] = "Required";
      if (!m.branch.trim()) e[`member_${idx}_branch`] = "Required";
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
      name: "", usn: "", semester: "", branch: "", email: "", phone: "", stay: "local", hostelName: "" 
    }] }));
  };

  const removeMember = (index: number) => {
    const newMembers = form.members.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, members: newMembers }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    try {
      await addDoc(collection(db, "registrations"), { ...form, createdAt: serverTimestamp() });
      setStatus("success");
      setForm({ teamName: "", act: "", leadName: "", usn: "", semester: "", branch: "", email: "", phone: "", stay: "local", hostelName: "", members: [] });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="register" className="py-32 px-4 relative flex justify-center">
      <div className="absolute inset-x-0 w-full h-[1px] top-0 bg-gradient-to-r from-transparent via-[rgba(212,175,55,0.2)] to-transparent" />

      <div className="max-w-4xl w-full relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
           <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="font-cinema text-4xl md:text-5xl text-[var(--ivory)] tracking-widest uppercase mb-4"
          >
            Claim Your Spot
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-script text-[var(--ivory-muted)] italic text-sm tracking-wide"
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
           
           <div className="bg-[#121212] p-6 md:p-14 border border-[rgba(212,175,55,0.15)] relative z-10 shadow-2xl backdrop-blur-sm overflow-hidden min-h-[400px] flex flex-col justify-center">
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
                    <p className="font-script text-[var(--ivory-muted)] mb-10 leading-loose">
                      Your team's script has been recorded. <br/>
                      Join us on the 24th of April, 2026.
                    </p>
                    <button
                      onClick={() => setStatus("idle")}
                      className="engraved-btn font-cinema tracking-widest uppercase px-10 py-4 text-xs"
                    >
                      Register Another Act
                    </button>
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
                          <input name="branch" value={form.branch} onChange={handleChange} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="e.g. ISE, CSE" />
                          {errors.branch && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors.branch}</p>}
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
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[rgba(212,175,55,0.2)] pb-2 mb-6 gap-4">
                        <h4 className="font-cinema text-[var(--antique-gold)] text-lg uppercase tracking-wider">III. Supporting Cast</h4>
                        <button type="button" onClick={addMember} className="flex items-center gap-2 font-script italic text-xs text-[var(--antique-gold-soft)] hover:text-[var(--ivory)] transition-colors border border-[rgba(212,175,55,0.3)] px-3 py-1.5 bg-[rgba(212,175,55,0.05)]">
                          <Plus size={14}/> <span>Add Teammate</span>
                        </button>
                      </div>

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
                                <input value={member.branch} onChange={(e) => handleMemberChange(idx, 'branch', e.target.value)} className="w-full input-royal px-4 py-3 font-script text-sm" placeholder="Branch" />
                                {errors[`member_${idx}_branch`] && <p className="text-[var(--royal-maroon)] text-xs mt-1 font-script italic">{errors[`member_${idx}_branch`]}</p>}
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
                        <p className="text-[var(--ivory-dim)] font-script italic text-sm opacity-50 text-center py-4 border border-dashed border-[rgba(212,175,55,0.2)]">No additional members added. (Solo Act)</p>
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
      </div>
    </section>
  );
}
