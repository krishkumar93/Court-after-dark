"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, MessageSquare, Building2 } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    regNo: "",
    subject: "Facility Inquiry",
    facility: "All Facilities",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    showToast("Message received! The LPU Sports Department will reach out to your student email.");
    setForm({ name: "", email: "", regNo: "", subject: "Facility Inquiry", facility: "All Facilities", message: "" });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="inline-flex items-center gap-1.5 rounded bg-red-50 border border-red-200 px-2.5 py-0.5 text-xs font-bold text-[#a71d2a] mb-2">
          <Building2 size={13} /> DIVISION OF STUDENT WELFARE • DSW ATHLETICS
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact LPU Sports Department
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
          Need assistance with sports facility reservations, floodlight scheduling, Olympic swimming slots, or inter-hostel tournament registrations? Reach out to the campus sports administration below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={18} className="text-[#a71d2a]" /> Campus Office & Reception
            </h2>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="text-[#a71d2a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">DSW Central Sports Desk</p>
                  <p className="text-slate-500 mt-0.5">
                    Shanti Devi Mittal Indoor Sports Complex, Block 13, Lovely Professional University, Phagwara, Punjab 144411
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="text-[#a71d2a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Desk & Helpdesk Hours</p>
                  <p className="text-slate-500 mt-0.5">Monday – Sunday: 06:00 AM – 11:00 PM (Daily Floodlight Shifts)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="text-[#a71d2a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">University Sports Hotline</p>
                  <p className="text-slate-500 mt-0.5">+91 1824 517000 (Reception Ext. 542)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail size={16} className="text-[#a71d2a] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-900">Official Sports Email</p>
                  <p className="text-slate-500 mt-0.5">sports@lpu.co.in</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-slate-700 space-y-1">
            <p className="font-bold text-[#a71d2a] flex items-center gap-1.5">
              <CheckCircle2 size={14} /> Immediate Court & Floodlight Assistance
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              For evening floodlight issues or gear returns during match hours, contact the duty coordinator stationed inside the Shanti Devi Mittal Complex reception counter.
            </p>
          </div>
        </div>

        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4 shadow-xs"
          >
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-[#a71d2a]" /> Send an Inquiry
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Registration No.</label>
                <input
                  type="text"
                  value={form.regNo}
                  onChange={(e) => setForm({ ...form, regNo: e.target.value })}
                  placeholder="e.g. 12104582"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="e.g. aarav.12104582@lpu.in"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inquiry Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#a71d2a] focus:bg-white cursor-pointer"
                >
                  <option value="Facility Inquiry">Court & Facility Reservation</option>
                  <option value="Olympic Pool">Olympic Pool 50-Min Slots</option>
                  <option value="Membership Query">Membership Plan & EDB Rates</option>
                  <option value="Equipment Rental">Sports Gear Issue / Return</option>
                  <option value="Inter-Hostel Tournament">Inter-Hostel Championship</option>
                  <option value="Disciplinary / Policy">Rules & Non-Marking Shoe Policy</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message Details</label>
              <textarea
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Describe your inquiry, requested dates, or facility feedback..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-[#a71d2a] focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#a71d2a] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#8e1520] transition shadow-xs cursor-pointer"
            >
              <Send size={14} />
              <span>Submit Inquiry</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
