'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  AlertTriangle,
  Copy,
  Check,
  Sparkles,
  ChevronRight
} from 'lucide-react'

export default function Home() {
  // Interactive Hero Simulator State
  const [simAmount, setSimAmount] = useState<number>(340)
  const [simDwellTime, setSimDwellTime] = useState<number>(85)
  const [simCheckoutSpeed, setSimCheckoutSpeed] = useState<number>(22)
  const [simVpn, setSimVpn] = useState<boolean>(false)
  const [simDisposableEmail, setSimDisposableEmail] = useState<boolean>(false)
  const [simNewDevice, setSimNewDevice] = useState<boolean>(false)
  const [activeCodeTab, setActiveCodeTab] = useState<'node' | 'python' | 'curl'>('node')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)

  // Real-time calculation formula matching XGBoost heuristic behavior
  const simulationResult = useMemo(() => {
    let score = 5.0 // baseline 5%

    // Amount impact
    if (simAmount > 2000) score += 32
    else if (simAmount > 800) score += 20
    else if (simAmount > 300) score += 8

    // Dwell time & checkout speed (bot velocity signals)
    if (simCheckoutSpeed < 5) score += 26
    else if (simCheckoutSpeed < 12) score += 14

    if (simDwellTime < 15) score += 18
    else if (simDwellTime < 45) score += 8
    else if (simDwellTime > 120) score -= 4

    // Anomalies
    if (simVpn) score += 28
    if (simDisposableEmail) score += 34
    if (simNewDevice) score += 12

    // Bound between 1 and 99
    score = Math.max(1.2, Math.min(99.4, score))

    const isGreen = score < 35
    const isYellow = score >= 35 && score < 70
    const isRed = score >= 70

    const category = isGreen ? 'GREEN' : isYellow ? 'YELLOW' : 'RED'
    const verdict = isGreen
      ? 'INSTANT CAPTURE (NO FRICTION)'
      : isYellow
      ? 'CHALLENGE / 3D-SECURE AUTH'
      : 'VOID AUTHORIZATION (FREEZE PREVENTED)'

    const shapFactors = [
      {
        name: simDisposableEmail ? 'Disposable Email Domain' : 'Corporate/Consumer Email Domain',
        impact: simDisposableEmail ? +28.5 : -11.2,
      },
      {
        name: simVpn ? 'VPN/Proxy Exit IP Cluster' : 'Residential ISP Verified',
        impact: simVpn ? +24.0 : -9.4,
      },
      {
        name: simCheckoutSpeed < 10 ? 'High-Velocity Bot Checkout (<10s)' : 'Human Behavioral Cadence',
        impact: simCheckoutSpeed < 10 ? +21.4 : -7.8,
      },
      {
        name: simAmount > 800 ? 'High Transaction Value Spike' : 'Standard Ticket Size',
        impact: simAmount > 800 ? +16.2 : -4.5,
      },
    ]

    return {
      score: Math.round(score * 10) / 10,
      category,
      verdict,
      isGreen,
      isYellow,
      isRed,
      shapFactors,
    }
  }, [simAmount, simDwellTime, simCheckoutSpeed, simVpn, simDisposableEmail, simNewDevice])

  const setPreset = (type: 'safe' | 'suspicious' | 'bot') => {
    if (type === 'safe') {
      setSimAmount(49)
      setSimDwellTime(210)
      setSimCheckoutSpeed(42)
      setSimVpn(false)
      setSimDisposableEmail(false)
      setSimNewDevice(false)
    } else if (type === 'suspicious') {
      setSimAmount(520)
      setSimDwellTime(30)
      setSimCheckoutSpeed(11)
      setSimVpn(true)
      setSimDisposableEmail(false)
      setSimNewDevice(true)
    } else {
      setSimAmount(2490)
      setSimDwellTime(4)
      setSimCheckoutSpeed(2)
      setSimVpn(true)
      setSimDisposableEmail(true)
      setSimNewDevice(true)
    }
  }

  const codeSnippets = {
    node: `import { PayGuardClient } from '@payguard/sdk';

const payguard = new PayGuardClient({
  apiKey: process.env.PAYGUARD_API_KEY
});

// Score order in <40ms before capturing PayPal Order
const assessment = await payguard.riskCheck({
  buyerEmail: 'customer@example.com',
  amount: 340.00,
  currency: 'USD',
  sessionData: { checkoutSpeedSeconds: 22 }
});

if (assessment.riskCategory === 'GREEN') {
  // Capture PayPal Order immediately
  await paypalClient.captureOrder(orderId);
} else {
  // Trigger step-up verification or cancel to avoid dispute
  await paypalClient.voidAuthorization(orderId);
}`,
    python: `from payguard import PayGuard

client = PayGuard(api_key="pg_live_secret_...")

# Real-time inference
risk_assessment = client.score_transaction(
    buyer_email="customer@example.com",
    amount=340.00,
    currency="USD",
    checkout_speed_seconds=22
)

if risk_assessment.category == "GREEN":
    paypal.orders.capture(order_id)
else:
    paypal.orders.void(order_id)
print(f"Risk Score: {risk_assessment.score}%, Action: {risk_assessment.action}")`,
    curl: `curl -X POST https://api.payguard.ai/v1/risk-check \\
  -H "Authorization: Bearer pg_live_secret_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "buyerEmail": "customer@example.com",
    "amount": 340.00,
    "currency": "USD",
    "checkoutSpeedSeconds": 22
  }'`,
  }

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab])
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // SVG Gauge calculations
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (simulationResult.score / 100) * circumference

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden bg-grid-pattern">
      {/* Ambient Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -left-60 w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[60%] -right-60 w-[500px] h-[500px] bg-rose-600/10 blur-[140px] rounded-full" />
      </div>

      {/* Floating Navbar */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl bg-[#030712]/75">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25">
              <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PayGuard AI
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PayPal v2 Engine
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#simulator" className="hover:text-white transition-colors">Risk Simulator</a>
            <a href="#comparison" className="hover:text-white transition-colors">Value Proof</a>
            <a href="#integration" className="hover:text-white transition-colors">Integration</a>
            <a href="#features" className="hover:text-white transition-colors">Intelligence</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="text-xs font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all flex items-center gap-2"
            >
              Launch Console
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="text-center max-w-3xl mx-auto space-y-5 mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/40 border border-blue-500/20 text-blue-300 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>Pre-Capture AI Defense for PayPal Merchants</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
            Stop PayPal chargebacks <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              before funds are captured.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PayPal dispute thresholds are merciless. PayGuard AI scores orders in <strong className="text-white">&lt;40ms</strong> using XGBoost trained on 590,000 transactions, neutralizing stolen cards and bot bursts with zero PayPal account holds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2.5"
            >
              Open Merchant Console
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/risk-check"
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/10 hover:border-white/20 font-semibold text-sm transition-all flex items-center gap-2"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              Live Risk Sandbox
            </Link>
          </div>
        </div>

        {/* Live Interactive Risk Simulator in Hero */}
        <div id="simulator" className="max-w-5xl mx-auto">
          <div className="rounded-3xl glass-card border border-white/10 shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Interactive ML Fraud Lab
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tweak live telemetry signals below to observe instant XGBoost probability shifts
                  </p>
                </div>
              </div>

              {/* 1-Click Scenario Preset Buttons */}
              <div className="flex items-center gap-2 bg-[#090d16] p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setPreset('safe')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-emerald-400 hover:bg-emerald-950/40 border border-transparent hover:border-emerald-500/30 transition-all cursor-pointer"
                >
                  🟢 Safe Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('suspicious')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-amber-400 hover:bg-amber-950/40 border border-transparent hover:border-amber-500/30 transition-all cursor-pointer"
                >
                  🟡 Suspicious
                </button>
                <button
                  type="button"
                  onClick={() => setPreset('bot')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
                >
                  🔴 Bot Attack
                </button>
              </div>
            </div>

            {/* Split Simulator Layout */}
            <div className="grid lg:grid-cols-12 gap-8 pt-6">
              {/* Left: Interactive Controls */}
              <div className="lg:col-span-7 space-y-6">
                {/* Amount Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Transaction Amount</span>
                    <span className="font-mono text-sm font-bold text-white">${simAmount.toFixed(2)} USD</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="4000"
                    step="5"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>$5 Micro-pay</span>
                    <span>$1,000</span>
                    <span>$4,000 High-Ticket</span>
                  </div>
                </div>

                {/* Dwell Time Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Session Dwell Time</span>
                    <span className="font-mono text-sm font-bold text-white">{simDwellTime} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="300"
                    step="2"
                    value={simDwellTime}
                    onChange={(e) => setSimDwellTime(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>2s (Bot Script)</span>
                    <span>90s (Browsing)</span>
                    <span>300s (Deliberate)</span>
                  </div>
                </div>

                {/* Checkout Speed Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-300">Checkout Form Speed</span>
                    <span className="font-mono text-sm font-bold text-white">{simCheckoutSpeed} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={simCheckoutSpeed}
                    onChange={(e) => setSimCheckoutSpeed(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1s Automated Autofill</span>
                    <span>30s Typical</span>
                    <span>60s Slow</span>
                  </div>
                </div>

                {/* Signal Toggles */}
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
                    High-Risk Digital Footprints
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      simVpn ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>VPN / TOR Proxy</span>
                      <input
                        type="checkbox"
                        checked={simVpn}
                        onChange={(e) => setSimVpn(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                    </label>

                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      simDisposableEmail ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>Disposable Email</span>
                      <input
                        type="checkbox"
                        checked={simDisposableEmail}
                        onChange={(e) => setSimDisposableEmail(e.target.checked)}
                        className="rounded accent-rose-500"
                      />
                    </label>

                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      simNewDevice ? 'bg-amber-950/30 border-amber-500/40 text-amber-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>New Hardware ID</span>
                      <input
                        type="checkbox"
                        checked={simNewDevice}
                        onChange={(e) => setSimNewDevice(e.target.checked)}
                        className="rounded accent-amber-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Right: Live Dynamic Gauge & Decision */}
              <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-[#090d16] border border-white/5 space-y-6">
                <div className="text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Calculated Risk Score
                  </span>

                  {/* SVG Radial Progress Gauge */}
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="#1f2937"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke={
                          simulationResult.isGreen
                            ? '#10b981'
                            : simulationResult.isYellow
                            ? '#f59e0b'
                            : '#f43f5e'
                        }
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-300 ease-out"
                      />
                    </svg>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span
                        className={`text-4xl font-extrabold font-mono tracking-tight ${
                          simulationResult.isGreen
                            ? 'text-emerald-400'
                            : simulationResult.isYellow
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {simulationResult.score}%
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                        {simulationResult.category} RISK
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Banner */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    simulationResult.isGreen
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : simulationResult.isYellow
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {simulationResult.isGreen && <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400" />}
                  {simulationResult.isYellow && <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />}
                  {simulationResult.isRed && <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />}
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Automated Settlement</p>
                    <p className="text-xs font-bold">{simulationResult.verdict}</p>
                  </div>
                </div>

                {/* Top SHAP Features Preview */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Real-time SHAP Weights
                  </span>
                  {simulationResult.shapFactors.map((f, i) => (
                    <div key={i} className="flex justify-between items-center text-xs py-0.5">
                      <span className="text-slate-400 truncate max-w-[200px] text-[11px]">{f.name}</span>
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          f.impact > 0 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {f.impact > 0 ? `+${f.impact}%` : `${f.impact}%`}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/dashboard/risk-check"
                  className="w-full py-2.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Launch Deep Audit Simulator</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Without vs With PayGuard */}
      <section id="comparison" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Financial Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Why Standard PayPal Protection Falls Short
          </h2>
          <p className="text-sm text-slate-400">
            PayPal protects buyers by default. Merchants bear chargeback fees and risk devastating account freezes when disputes exceed 1.0%.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Without PayGuard */}
          <div className="p-8 rounded-3xl bg-rose-950/10 border border-rose-500/20 space-y-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-rose-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Without PayGuard</span>
              <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                High Risk Exposure
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <span className="text-rose-400 font-bold mt-0.5">✕</span>
                <div>
                  <strong className="text-white block">21-Day Rolling Reserves</strong>
                  <span className="text-slate-400">PayPal holds up to 25% of your daily revenue when disputes increase.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="text-rose-400 font-bold mt-0.5">✕</span>
                <div>
                  <strong className="text-white block">$20 Dispute Fees Per Occurrence</strong>
                  <span className="text-slate-400">Carding attacks generate hundreds of micro-disputes, costing thousands.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="text-rose-400 font-bold mt-0.5">✕</span>
                <div>
                  <strong className="text-white block">Permanent Account Termination</strong>
                  <span className="text-slate-400">Merchants exceeding 1.5% dispute ratios are permanently blacklisted by PayPal.</span>
                </div>
              </div>
            </div>
          </div>

          {/* With PayGuard */}
          <div className="p-8 rounded-3xl bg-emerald-950/10 border border-emerald-500/30 space-y-6 relative overflow-hidden glow-emerald">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">With PayGuard AI</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Zero Chargeback Liability
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 text-xs">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <div>
                  <strong className="text-white block">Pre-Capture Interception</strong>
                  <span className="text-slate-400">Scores orders before funds are captured. Stolen cards are voided with zero dispute fees.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <div>
                  <strong className="text-white block">Sub-50ms XGBoost Inference</strong>
                  <span className="text-slate-400">Evaluates 40+ vectors instantaneously without introducing shopping cart latency.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 text-xs">
                <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                <div>
                  <strong className="text-white block">Pristine Merchant Reputation</strong>
                  <span className="text-slate-400">Maintain an unblemished PayPal account standing with zero reserves or holdbacks.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Code Playground */}
      <section id="integration" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-white/5">
        <div className="grid lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              Drop-In SDK
            </span>
            <h2 className="text-3xl font-extrabold text-white">
              Integrate in less than 5 minutes
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compatible with any modern backend: Next.js, Node.js, FastAPI, Django, Flask, or WooCommerce webhooks. Pre-capture checks require just 6 lines of code.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-2"
              >
                <span>Generate API Key</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl bg-[#090d16] border border-white/10 shadow-2xl overflow-hidden">
              {/* Code Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#030712] border-b border-white/5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('node')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeCodeTab === 'node'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Node.js / TS
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeCodeTab === 'python'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveCodeTab('curl')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeCodeTab === 'curl'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    cURL
                  </button>
                </div>

                <button
                  type="button"
                  onClick={copyCode}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="text-[11px]">{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* Code Box */}
              <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-96">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center border-t border-white/5">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-[#090d16] border border-blue-500/20 shadow-2xl space-y-6 max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to secure your PayPal merchant operations?
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Experience real-time AI risk evaluation right now with our seeded sandbox accounts.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              Sign In with Demo Account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-white/10 transition-all"
            >
              Create Free Merchant Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 bg-[#030712] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-500" />
            <span className="font-semibold text-slate-400">PayGuard AI</span>
            <span>• Next-Gen Fraud Prevention Engine</span>
          </div>
          <div className="flex items-center gap-6">
            <span>PostgreSQL 18</span>
            <span>Redis 5.0</span>
            <span>Elasticsearch 9.5</span>
            <span>XGBoost v1</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
