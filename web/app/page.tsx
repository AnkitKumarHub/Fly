"use client";

import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon, Mail01Icon, Calendar01Icon, SparklesIcon, CheckmarkCircle01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export default function LandingPage() {
  const scrollVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0A] text-[#F2F4F2] font-sans selection:bg-[#BDCDD6] selection:text-[#0A0B0A] relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          to { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}} />
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[#BDCDD6] opacity-20 blur-[100px]"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto backdrop-blur-md sticky top-0 border-b border-white/5 z-50">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#BDCDD6] text-[#0A0B0A]">
              <HugeiconsIcon icon={CommandIcon} strokeWidth={2.5} className="size-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">Fly</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#929E96]">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden sm:block text-sm font-medium text-[#929E96] hover:text-white transition-colors">Sign in</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard" className="px-4 py-2 text-sm font-medium bg-white text-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)] block">
                Start free
              </Link>
            </motion.div>
          </div>
        </header>

        {/* Hero Section */}
        <motion.section 
          initial="hidden" 
          animate="visible" 
          variants={scrollVariant}
          className="pt-24 pb-16 px-6 max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16"
        >
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141615] border border-white/10 text-xs font-medium text-[#BDCDD6]">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3" />
              <span>Gmail and Calendar, finally in rhythm</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-white">
              Your day, <br className="hidden lg:block"/>arranged before <br className="hidden lg:block"/>it starts shouting.
            </h1>
            <p className="text-lg text-[#929E96] max-w-xl leading-relaxed">
              Tell Fly what needs to happen. It reads the request, schedules the meeting, prepares the follow-up, and keeps the next action obvious.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/dashboard" className="w-full px-6 py-3 text-sm font-semibold bg-white text-black rounded-full text-center flex items-center justify-center gap-2">
                  Get started free
                  <span className="text-black/50">→</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="#pricing" className="w-full px-6 py-3 text-sm font-medium bg-[#141615] border border-white/10 text-white rounded-full text-center block">
                  View pricing
                </Link>
              </motion.div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex-1 w-full relative"
          >
            <div className="absolute inset-0 bg-[#BDCDD6] opacity-10 blur-[80px] rounded-full"></div>
            {/* Command Palette Mockup */}
            <div className="relative bg-[#141615] border border-[#BDCDD6]/20 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
                <span className="text-xs font-bold text-[#BDCDD6] tracking-widest uppercase">Fly Command</span>
              </div>
              <div className="bg-[#0A0B0A] border border-white/5 rounded-xl p-4 mb-4">
                <p className="text-white text-sm font-medium">Schedule Mira for Thursday, make it high priority, and send a warm confirm.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0B0A]/50 border border-[#BDCDD6]/10">
                  <div className="bg-[#BDCDD6]/10 p-2 rounded-lg text-[#BDCDD6]">
                    <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Calendar event created</p>
                    <p className="text-xs text-[#929E96]">Thu, 10:30 AM • High priority</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0B0A]/50 border border-[#E8D5C4]/10">
                  <div className="bg-[#E8D5C4]/10 p-2 rounded-lg text-[#E8D5C4]">
                    <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Email draft ready</p>
                    <p className="text-xs text-[#929E96]">Friendly, concise, ready to review</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                <p className="text-xs text-[#929E96] flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3 text-[#BDCDD6]" />
                  Review checkpoint on. Nothing sensitive sends blind.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Metrics Bar */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scrollVariant}
          className="px-6 max-w-6xl mx-auto pb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-2xl bg-[#141615] border border-white/5">
            <div className="space-y-2">
              <p className="text-4xl font-black tracking-tighter text-white">42%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Less inbox switching</p>
            </div>
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-4xl font-black tracking-tighter text-white">3 min</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Average scheduling flow</p>
            </div>
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-4xl font-black tracking-tighter text-white">24/7</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Calendar context</p>
            </div>
          </div>
        </motion.section>

        {/* Bento Grid Features */}
        <motion.section 
          id="features" 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scrollVariant}
          className="px-6 max-w-6xl mx-auto py-24 border-t border-white/5"
        >
          <div className="mb-16 max-w-2xl">
            <p className="text-[#BDCDD6] text-xs font-bold uppercase tracking-widest mb-4">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-6">
              The smart calendar assistant that keeps your day simple.
            </h2>
            <p className="text-lg text-[#929E96]">
              Every feature is written in plain words so you always know what your schedule is doing. Fly is built for the recurring mess: a client emails a date, someone changes the time, the calendar needs priority.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">01</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Plain-language scheduling</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Ask for a meeting the way you would text a teammate. Fly finds the intent, date, guest, and priority instantly.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">02</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gmail plus Calendar context</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                See the email thread beside the calendar move it caused, so decisions stay traceable without tab hopping.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">03</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Follow-ups with review</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Draft confirmations, reminders, and next-step emails with clear review points before anything important goes out.
              </p>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">04</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8">
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Priority focus mode</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Mark what matters, quiet the noise, and keep the next useful action visible across your day seamlessly.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Workflow Simulation (The Engine) */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scrollVariant}
          className="px-6 max-w-6xl mx-auto py-24 border-t border-white/5"
        >
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white leading-tight mb-4">
              How Fly checks everything before action.
            </h2>
            <p className="text-lg text-[#929E96] max-w-2xl mx-auto">
              A transparent, zero-trust pipeline. Fly does the heavy lifting, but you retain absolute control.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative max-w-4xl mx-auto mt-12">
            {/* Node 1 */}
            <div className="bg-[#141615] border border-white/10 p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center shadow-lg">
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-white mb-4">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">1. Ingestion</h3>
              <p className="text-[#929E96] text-xs">Reads incoming client emails to detect intent and request.</p>
            </div>

            {/* Connector 1 */}
            <div className="hidden md:block absolute left-[16.66%] right-[50%] top-1/2 -translate-y-1/2 h-[2px] bg-[linear-gradient(to_right,rgba(255,255,255,0.2)_50%,transparent_50%)] bg-[length:12px_100%] animate-pulse"></div>

            {/* Node 2 */}
            <div className="bg-[#141615] border border-white/10 p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center shadow-lg">
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-white mb-4">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">2. AI Processing</h3>
              <p className="text-[#929E96] text-xs">Checks available calendar slots and extracts internal context.</p>
            </div>

            {/* Connector 2 */}
            <div className="hidden md:block absolute left-[50%] right-[16.66%] top-1/2 -translate-y-1/2 h-[2px] bg-[linear-gradient(to_right,rgba(189,205,214,0.4)_50%,transparent_50%)] bg-[length:12px_100%] animate-pulse"></div>

            {/* Node 3 (Highlight) */}
            <div className="bg-[#141615] border border-[#BDCDD6] p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center shadow-[0_0_30px_rgba(189,205,214,0.2)]">
              <div className="absolute -top-3 bg-[#BDCDD6] text-[#0A0B0A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-md">
                Waiting for Approval
              </div>
              <div className="bg-[#BDCDD6]/10 p-3 rounded-xl border border-[#BDCDD6]/20 text-[#BDCDD6] mb-4 mt-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">3. Staging / Approval</h3>
              <p className="text-[#929E96] text-xs">Creates draft responses without auto-sending. You review and click send.</p>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Marquee */}
        <motion.section 
          id="testimonials" 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scrollVariant}
          className="py-24 border-t border-white/5 overflow-hidden flex flex-col items-center justify-center"
        >
          <div className="px-6 max-w-6xl mx-auto w-full mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <p className="text-[#E8D5C4] text-xs font-bold uppercase tracking-widest mb-4">Real Stories</p>
              <h2 className="text-4xl font-black tracking-tighter text-white leading-tight">
                People love how easily Fly keeps their day moving.
              </h2>
            </div>
            <p className="text-xs text-[#929E96] uppercase tracking-widest">Hover or focus the row to pause</p>
          </div>

          <div className="relative flex overflow-x-hidden w-full group">
            <div className="animate-marquee whitespace-nowrap flex items-center gap-6 group-hover:[animation-play-state:paused]">
              {[1, 2, 3, 4, 5, 6].map((_, i) => (
                <div key={i} className="flex gap-6 shrink-0">
                  <div className="w-[350px] bg-[#141615] border border-white/5 p-8 rounded-2xl inline-flex flex-col whitespace-normal hover:border-white/20 transition-colors">
                    <p className="text-[#BDCDD6] text-4xl font-serif mb-4">"</p>
                    <p className="text-[#929E96] text-sm leading-relaxed flex-1 mb-6">
                      Our standups finally stopped leaking into email. The calendar and inbox context saves so much backtracking.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#BDCDD6]/10 text-[#BDCDD6] flex items-center justify-center text-xs font-bold">K</div>
                      <div>
                        <p className="text-sm font-bold text-white">Kavya</p>
                        <p className="text-xs text-[#929E96]">Product Manager</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-[350px] bg-[#141615] border border-white/5 p-8 rounded-2xl inline-flex flex-col whitespace-normal hover:border-white/20 transition-colors">
                    <p className="text-[#E8D5C4] text-4xl font-serif mb-4">"</p>
                    <p className="text-[#929E96] text-sm leading-relaxed flex-1 mb-6">
                      Fly made my calendar feel calm again. I can ask it to set meetings and it just handles the email too.
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-[#E8D5C4]/10 text-[#E8D5C4] flex items-center justify-center text-xs font-bold">A</div>
                      <div>
                        <p className="text-sm font-bold text-white">Anjali</p>
                        <p className="text-xs text-[#929E96]">Small business owner</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Pricing */}
        <motion.section 
          id="pricing" 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={scrollVariant}
          className="py-28 border-t border-white/5 px-6"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-[#BDCDD6] text-xs font-bold uppercase tracking-widest mb-4">Pricing</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                Choose the plan that fits your day.
              </h2>
              <p className="text-lg text-[#929E96]">Start free and upgrade when you want deeper automation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Free */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="bg-[#141615] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-colors duration-300 shadow-lg"
              >
                <h3 className="text-xl font-bold text-white mb-2">Free</h3>
                <p className="text-sm text-[#929E96] mb-8">For trying the calmer way to plan a day.</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-sm font-medium text-[#929E96]">/ month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> Calendar + Gmail summary</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> 5 AI requests per week</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> Manual review before send</li>
                </ul>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full py-3 rounded-full bg-[#0A0B0A] border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                  Choose Free
                </motion.button>
              </motion.div>

              {/* Pro */}
              <motion.div 
                whileHover={{ scale: 1.07 }} 
                className="bg-[#141615] border border-[#BDCDD6] rounded-3xl p-8 relative scale-100 md:scale-105 z-10 shadow-[0_0_40px_rgba(189,205,214,0.1)] hover:shadow-[0_0_50px_rgba(189,205,214,0.2)] transition-shadow duration-300"
              >
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#BDCDD6] text-[#0A0B0A] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                  <HugeiconsIcon icon={SparklesIcon} className="size-3"/> Popular
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                <p className="text-sm text-[#929E96] mb-8">For people who live between meetings and email.</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$12</span>
                  <span className="text-sm font-medium text-[#929E96]">/ month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-[#BDCDD6]"/> Unlimited scheduling prompts</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-[#BDCDD6]"/> Meeting priority tags</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-[#BDCDD6]"/> Automatic follow-up drafts</li>
                </ul>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full py-3 rounded-full bg-[#BDCDD6] text-[#0A0B0A] font-bold hover:bg-[#BDCDD6]/90 transition-colors">
                  Choose Pro
                </motion.button>
              </motion.div>

              {/* Pro+ */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                className="bg-[#141615] border border-white/5 rounded-3xl p-8 hover:border-white/20 transition-colors duration-300 shadow-lg"
              >
                <h3 className="text-xl font-bold text-white mb-2">Pro +</h3>
                <p className="text-sm text-[#929E96] mb-8">For operators who want deeper workflow automation.</p>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black text-white">$24</span>
                  <span className="text-sm font-medium text-[#929E96]">/ month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> Shared calendar suggestions</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> Email templates and follow-ups</li>
                  <li className="flex items-center gap-3 text-sm text-[#929E96]"><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-white/20"/> Priority inbox focus mode</li>
                </ul>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full py-3 rounded-full bg-[#0A0B0A] border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">
                  Choose Pro +
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="border-t border-white/5 pt-24 pb-8 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-16 mb-24">
              <div className="max-w-md">
                <p className="text-[#E8D5C4] text-xs font-bold uppercase tracking-widest mb-4">Stay Connected</p>
                <h2 className="text-4xl font-black tracking-tighter text-white mb-6">
                  Fly keeps your schedule calm and your inbox clear.
                </h2>
                <p className="text-[#929E96] text-sm">Follow Fly for product updates, build notes, and practical automation ideas.</p>
              </div>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.1 }} className="size-10 rounded-full bg-[#141615] border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">X</motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="size-10 rounded-full bg-[#141615] border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">In</motion.div>
                <motion.div whileHover={{ scale: 1.1 }} className="size-10 rounded-full bg-[#141615] border border-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors cursor-pointer">Gh</motion.div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between border-t border-white/5 pt-8 text-xs font-medium text-[#929E96]">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <div className="size-4 bg-[#BDCDD6] rounded-[4px] flex items-center justify-center text-[#0A0B0A]">
                  <HugeiconsIcon icon={CommandIcon} className="size-3"/>
                </div>
                <p>© 2026 Fly. Built for people who want a calmer day.</p>
              </div>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
