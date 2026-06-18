"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { CommandIcon, Mail01Icon, Calendar01Icon, SparklesIcon, CheckmarkCircle01Icon, ZapIcon } from "@hugeicons/core-free-icons";
import { FaGithub, FaSlack, FaGoogleDrive } from "react-icons/fa";
import { SiGmail, SiGooglecalendar } from "react-icons/si";
import Link from "next/link";

export default function LandingPage() {
  // Parallax scroll hooks
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -120]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -60]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -180]);
  const y4 = useTransform(scrollY, [0, 1000], [0, -90]);
  const y5 = useTransform(scrollY, [0, 1000], [0, -150]);

  const scrollVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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

        {/* Hero Section with Floating Integrations */}
        <section className="relative pt-24 pb-16 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 min-h-[85vh]">
          {/* Floating Background Icons (Parallax) */}
          <div className="absolute inset-0 pointer-events-none hidden md:block overflow-visible z-0">
            <motion.div style={{ y: y1 }} className="absolute top-[10%] left-[5%] bg-[#141615] border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <SiGmail className="size-6 text-[#ea4335]" />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: y2 }} className="absolute top-[60%] left-[2%] bg-[#141615] border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md">
              <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}>
                <FaSlack className="size-6 text-[#E01E5A]" />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: y3 }} className="absolute top-[5%] right-[40%] bg-[#141615] border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}>
                <SiGooglecalendar className="size-6 text-[#4285F4]" />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: y4 }} className="absolute bottom-[10%] left-[45%] bg-[#141615] border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md">
              <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1.5 }}>
                <FaGithub className="size-6 text-white" />
              </motion.div>
            </motion.div>
            <motion.div style={{ y: y5 }} className="absolute top-[20%] right-[5%] bg-[#141615] border border-white/10 p-3 rounded-2xl shadow-xl backdrop-blur-md">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 2 }}>
                <FaGoogleDrive className="size-6 text-[#FFBA00]" />
              </motion.div>
            </motion.div>
          </div>

          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={scrollVariant}
            className="flex-1 space-y-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141615] border border-white/10 text-xs font-medium text-[#BDCDD6] shadow-lg">
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-3" />
              <span>Connect the apps you already use</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.05] text-white">
              Your day, <br className="hidden lg:block"/>arranged before <br className="hidden lg:block"/>it starts shouting.
            </h1>
            <p className="text-lg text-[#929E96] max-w-xl leading-relaxed">
              Tell Fly what needs to happen. It reads the request across your tools, schedules the meeting, prepares the follow-up, and keeps the next action obvious.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="/dashboard" className="w-full px-6 py-3 text-sm font-semibold bg-white text-black rounded-full text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)]">
                  Get started free
                  <span className="text-black/50">→</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Link href="#pricing" className="w-full px-6 py-3 text-sm font-medium bg-[#141615] border border-white/10 text-white rounded-full text-center block hover:bg-white/5 transition-colors">
                  View pricing
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Layered 3D Dashboard Mockup */}
          <div className="flex-1 w-full relative h-[400px] md:h-[500px] z-10 perspective-1000">
            <div className="absolute inset-0 bg-[#BDCDD6] opacity-10 blur-[100px] rounded-full"></div>
            
            {/* Background Layer (Blurred context) */}
            <motion.div 
              initial={{ opacity: 0, x: 40, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
              className="absolute top-0 right-0 w-[85%] bg-[#0A0B0A]/80 border border-white/5 rounded-2xl p-4 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-3">
                <SiGooglecalendar className="size-3 text-[#4285F4]" />
                <span className="text-xs font-medium text-[#929E96]">Thursday, Oct 12</span>
              </div>
              <div className="space-y-2 opacity-50">
                <div className="h-10 bg-white/5 rounded-lg w-full"></div>
                <div className="h-10 bg-white/5 rounded-lg w-3/4"></div>
              </div>
            </motion.div>

            {/* Middle Layer (Main Command Palette) */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7, type: "spring" }}
              className="absolute top-20 left-0 w-[90%] bg-[#141615] border border-[#BDCDD6]/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-10"
            >
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
                    <p className="text-sm font-medium text-white">Calendar event prepared</p>
                    <p className="text-xs text-[#929E96]">Thu, 10:30 AM • High priority</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Top Layer (Floating Success Badge) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.5, type: "spring", bounce: 0.5 }}
              className="absolute bottom-16 right-0 bg-[#BDCDD6] border border-white/20 p-4 rounded-2xl shadow-[0_20px_40px_rgba(189,205,214,0.25)] z-20 flex items-center gap-4"
            >
              <div className="bg-[#0A0B0A] p-2 rounded-full text-[#BDCDD6]">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0A0B0A]">Ready to review</p>
                <p className="text-xs text-[#0A0B0A]/70 font-medium">Draft & Event staged</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Metrics Bar */}
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true }} 
          variants={staggerContainer}
          className="px-6 max-w-6xl mx-auto pb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 rounded-2xl bg-[#141615] border border-white/5 shadow-xl">
            <motion.div variants={staggerItem} className="space-y-2">
              <p className="text-4xl font-black tracking-tighter text-white">42%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Less inbox switching</p>
            </motion.div>
            <motion.div variants={staggerItem} className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-4xl font-black tracking-tighter text-white">3 min</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Average scheduling flow</p>
            </motion.div>
            <motion.div variants={staggerItem} className="space-y-2 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-4xl font-black tracking-tighter text-white">24/7</p>
              <p className="text-xs font-bold uppercase tracking-widest text-[#929E96]">Calendar context</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Bento Grid Features */}
        <section id="features" className="px-6 max-w-6xl mx-auto py-24 border-t border-white/5">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={scrollVariant}
            className="mb-16 max-w-2xl"
          >
            <p className="text-[#BDCDD6] text-xs font-bold uppercase tracking-widest mb-4">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-tight mb-6">
              The smart calendar assistant that keeps your day simple.
            </h2>
            <p className="text-lg text-[#929E96]">
              Every feature is written in plain words so you always know what your schedule is doing. Fly is built for the recurring mess: a client emails a date, someone changes the time, the calendar needs priority.
            </p>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }} 
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">01</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Plain-language scheduling</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Ask for a meeting the way you would text a teammate. Fly finds the intent, date, guest, and priority instantly.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">02</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gmail plus Calendar context</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                See the email thread beside the calendar move it caused, so decisions stay traceable without tab hopping.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">03</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Follow-ups with review</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Draft confirmations, reminders, and next-step emails with clear review points before anything important goes out.
              </p>
            </motion.div>

            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-8 rounded-2xl hover:border-[#BDCDD6]/50 transition-colors duration-300 group shadow-lg hover:shadow-[0_0_20px_rgba(189,205,214,0.15)] relative overflow-hidden">
              <div className="absolute top-8 right-8 text-6xl font-black text-white/5 group-hover:text-white/10 transition-colors">04</div>
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-[#BDCDD6] w-max mb-8 group-hover:scale-110 transition-transform">
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={2} className="size-5" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Priority focus mode</h3>
              <p className="text-[#929E96] text-sm leading-relaxed relative z-10">
                Mark what matters, quiet the noise, and keep the next useful action visible across your day seamlessly.
              </p>
            </motion.div>
          </motion.div>
        </section>

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
            <motion.div 
              initial={{ borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 0 0px rgba(189,205,214,0)" }}
              whileInView={{ borderColor: "rgba(189,205,214,0.3)", boxShadow: "0 0 20px rgba(189,205,214,0.05)" }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut", delay: 0 }}
              className="bg-[#141615] border-2 p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center"
            >
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-white mb-4">
                <HugeiconsIcon icon={Mail01Icon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">1. Ingestion</h3>
              <p className="text-[#929E96] text-xs">Reads incoming client emails to detect intent and request.</p>
            </motion.div>

            {/* Connector 1 */}
            <div className="hidden md:block absolute left-[16.66%] right-[50%] top-1/2 -translate-y-1/2 h-[2px] bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#BDCDD6] to-transparent opacity-80"
              />
            </div>

            {/* Node 2 */}
            <motion.div 
              initial={{ borderColor: "rgba(255,255,255,0.05)", boxShadow: "0 0 0px rgba(189,205,214,0)" }}
              whileInView={{ borderColor: "rgba(189,205,214,0.5)", boxShadow: "0 0 25px rgba(189,205,214,0.1)" }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut", delay: 0.6 }}
              className="bg-[#141615] border-2 p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center"
            >
              <div className="bg-[#0A0B0A] p-3 rounded-xl border border-white/10 text-white mb-4">
                <HugeiconsIcon icon={ZapIcon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">2. AI Processing</h3>
              <p className="text-[#929E96] text-xs">Checks available calendar slots and extracts internal context.</p>
            </motion.div>

            {/* Connector 2 */}
            <div className="hidden md:block absolute left-[50%] right-[16.66%] top-1/2 -translate-y-1/2 h-[2px] bg-white/5 overflow-hidden">
              <motion.div 
                initial={{ x: "-100%" }}
                animate={{ x: "300%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", delay: 1 }}
                className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#BDCDD6] to-transparent opacity-80"
              />
            </div>

            {/* Node 3 (Highlight) */}
            <motion.div 
              initial={{ borderColor: "rgba(189,205,214,0.3)", boxShadow: "0 0 10px rgba(189,205,214,0.1)" }}
              whileInView={{ borderColor: "rgba(189,205,214,1)", boxShadow: "0 0 40px rgba(189,205,214,0.3)" }}
              transition={{ repeat: Infinity, duration: 2, repeatType: "reverse", ease: "easeInOut", delay: 1.2 }}
              className="bg-[#141615] border-2 p-6 rounded-2xl w-full md:w-1/3 relative z-10 flex flex-col items-center text-center"
            >
              <div className="absolute -top-3 bg-[#BDCDD6] text-[#0A0B0A] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap shadow-[0_0_15px_rgba(189,205,214,0.5)]">
                Waiting for Approval
              </div>
              <div className="bg-[#BDCDD6]/10 p-3 rounded-xl border border-[#BDCDD6]/20 text-[#BDCDD6] mb-4 mt-2">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} strokeWidth={2} className="size-6" />
              </div>
              <h3 className="text-white font-bold mb-2">3. Staging / Approval</h3>
              <p className="text-[#929E96] text-xs">Creates draft responses without auto-sending. You review and click send.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Integrations Showcase */}
        <section className="px-6 max-w-6xl mx-auto py-24 border-t border-white/5">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={scrollVariant}
            className="mb-16 text-center"
          >
            <p className="text-[#BDCDD6] text-xs font-bold uppercase tracking-widest mb-4">Integrations</p>
            <h2 className="text-4xl font-black tracking-tighter text-white leading-tight mb-6">
              Connects with tools you already use.
            </h2>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={staggerContainer}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* GitHub */}
            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors shadow-lg group">
              <div className="bg-white p-3 rounded-2xl w-max mb-4 shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-shadow">
                <FaGithub className="size-8 text-[#0A0B0A]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">GitHub</h3>
              <p className="text-[#929E96] text-xs leading-relaxed">Connect to track PRs and sync code updates directly to your calendar blocks.</p>
            </motion.div>

            {/* Gmail */}
            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors shadow-lg group">
              <div className="bg-white p-3 rounded-2xl w-max mb-4 shadow-[0_0_15px_rgba(234,67,53,0.2)] group-hover:shadow-[0_0_25px_rgba(234,67,53,0.4)] transition-shadow">
                <SiGmail className="size-8 text-[#ea4335]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gmail</h3>
              <p className="text-[#929E96] text-xs leading-relaxed">Fly drafts responses and links email threads directly to your calendar events.</p>
            </motion.div>

            {/* Slack */}
            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors shadow-lg group">
              <div className="bg-white p-3 rounded-2xl w-max mb-4 shadow-[0_0_15px_rgba(224,30,90,0.2)] group-hover:shadow-[0_0_25px_rgba(224,30,90,0.4)] transition-shadow">
                <FaSlack className="size-8 text-[#E01E5A]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Slack</h3>
              <p className="text-[#929E96] text-xs leading-relaxed">Turn DMs into tasks and meetings instantly with simple slash commands.</p>
            </motion.div>

            {/* Drive */}
            <motion.div variants={staggerItem} whileHover={{ y: -5 }} className="bg-[#141615] border border-white/5 p-6 rounded-2xl hover:border-white/20 transition-colors shadow-lg group">
              <div className="bg-white p-3 rounded-2xl w-max mb-4 shadow-[0_0_15px_rgba(255,186,0,0.2)] group-hover:shadow-[0_0_25px_rgba(255,186,0,0.4)] transition-shadow">
                <FaGoogleDrive className="size-8 text-[#FFBA00]" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Google Drive</h3>
              <p className="text-[#929E96] text-xs leading-relaxed">Auto-attach relevant documents to meetings based on the email context.</p>
            </motion.div>
          </motion.div>
        </section>

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
        <section id="pricing" className="py-28 border-t border-white/5 px-6">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={scrollVariant}
            className="max-w-6xl mx-auto"
          >
            <div className="text-center mb-16">
              <p className="text-[#BDCDD6] text-xs font-bold uppercase tracking-widest mb-4">Pricing</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-6">
                Choose the plan that fits your day.
              </h2>
              <p className="text-lg text-[#929E96]">Start free and upgrade when you want deeper automation.</p>
            </div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
            >
              {/* Free */}
              <motion.div 
                variants={staggerItem}
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
                variants={staggerItem}
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
                variants={staggerItem}
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
            </motion.div>
          </motion.div>
        </section>

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
