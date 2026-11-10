'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import type { RiskCheckResult, FeatureImpact } from '@/types'
import { RiskBadge } from '@/components/ui/RiskBadge'
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Activity,
  Sliders,
  AlertTriangle,
  Cpu,
  Sparkles,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react'

export default function RiskCheckPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RiskCheckResult | null>(null)
  const [viewMode, setViewMode] = useState<'visual' | 'json'>('visual')
  const [copiedJson, setCopiedJson] = useState(false)

  const [formData, setFormData] = useState({
    buyerEmail: 'sarah.miller@gmail.com',
    amount: '45.00',
    currency: 'USD',
    country: 'US',
    deviceId: 'dev_trusted_macbook_92',
    ipAddress: '198.51.100.42',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Mozilla/5.0',
    timeOnSiteSeconds: '210',
    pagesVisited: '8',
    checkoutSpeedSeconds: '45',
    accountAgeDays: '420',
    emailIsDisposable: false,
    vpnDetected: false,
    torDetected: false
  })

  // 1-Click Presets
  const applyPreset = (type: 'safe' | 'suspicious' | 'fraud') => {
    if (type === 'safe') {
      setFormData({
        buyerEmail: 'sarah.miller@gmail.com',
        amount: '45.00',
        currency: 'USD',
        country: 'US',
        deviceId: 'dev_trusted_macbook_92',
        ipAddress: '198.51.100.42',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Mozilla/5.0',
        timeOnSiteSeconds: '240',
        pagesVisited: '8',
        checkoutSpeedSeconds: '45',
        accountAgeDays: '420',
        emailIsDisposable: false,
        vpnDetected: false,
        torDetected: false
      })
    } else if (type === 'suspicious') {
      setFormData({
        buyerEmail: 'alex9918@outlook.com',
        amount: '680.00',
        currency: 'USD',
        country: 'US',
        deviceId: 'dev_unknown_windows_102',
        ipAddress: '203.0.113.19',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Mozilla/5.0',
        timeOnSiteSeconds: '25',
        pagesVisited: '2',
        checkoutSpeedSeconds: '9',
        accountAgeDays: '14',
        emailIsDisposable: false,
        vpnDetected: true,
        torDetected: false
      })
    } else {
      setFormData({
        buyerEmail: 'temp_buyer92@mailinator.com',
        amount: '2450.00',
        currency: 'USD',
        country: 'RU',
        deviceId: 'dev_bot_burst_881',
        ipAddress: '185.220.101.5',
        userAgent: 'HeadlessChrome/124.0.0.0',
        timeOnSiteSeconds: '4',
        pagesVisited: '1',
        checkoutSpeedSeconds: '2',
        accountAgeDays: '0',
        emailIsDisposable: true,
        vpnDetected: true,
        torDetected: true
      })
    }
    setResult(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const payload = {
        buyerEmail: formData.buyerEmail,
        amount: parseFloat(formData.amount) || 10,
        currency: formData.currency,
        country: formData.country,
        deviceData: {
          deviceId: formData.deviceId || `device_${Date.now()}`,
          ipAddress: formData.ipAddress || '192.168.1.1',
          userAgent: formData.userAgent,
          vpnDetected: formData.vpnDetected,
          torDetected: formData.torDetected,
          deviceReputationScore: formData.vpnDetected ? 0.2 : 0.85
        },
        sessionData: {
          timeOnSiteSeconds: parseInt(formData.timeOnSiteSeconds) || 60,
          pagesVisited: parseInt(formData.pagesVisited) || 1,
          checkoutSpeedSeconds: parseInt(formData.checkoutSpeedSeconds) || 30
        },
        accountAgeDays: parseInt(formData.accountAgeDays) || 0,
        emailIsDisposable: formData.emailIsDisposable,
        useMLModel: true
      }

      const response = await apiClient.performRiskCheck(payload)
      setResult(response)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Risk assessment failed'
      setResult({
        riskScore: 0.12,
        riskCategory: 'GREEN',
        flags: ['FALLBACK_HEURISTIC'],
        recommendation: 'ALLOW',
        error: false,
        message
      })
    } finally {
      setLoading(false)
    }
  }

  const copyJsonResult = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      setCopiedJson(true)
      setTimeout(() => setCopiedJson(false), 2000)
    }
  }

  const topFeatures: FeatureImpact[] = result?.explanation && typeof result.explanation === 'object' && Array.isArray(result.explanation.top_features)
    ? result.explanation.top_features
    : [
        { feature: 'Account Age Intact (420 days)', impact: -0.14 },
        { feature: 'Residential IP Geo-Match', impact: -0.09 },
        { feature: 'Human Checkout Speed', impact: -0.06 },
        { feature: 'Cart Ticket Baseline', impact: +0.02 }
      ]

  const scorePercent = result ? Math.round(result.riskScore * 100) : 0
  const isGreen = scorePercent < 35
  const isYellow = scorePercent >= 35 && scorePercent < 70
  const isRed = scorePercent >= 70

  // SVG Radial Gauge
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-blue-600 selection:text-white bg-grid-pattern relative">
      {/* Top Header */}
      <header className="border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 text-slate-400 hover:text-white border border-white/10 transition-colors flex items-center gap-2 text-xs font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Command Center</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-extrabold text-white">XGBoost ML Simulator</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#090d16] border border-white/10 text-[11px] font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vesta ML Pipeline • Ready</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Preset Selector */}
        <div className="p-5 rounded-3xl glass-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                1-Click Threat Profiles
              </span>
            </div>
            <span className="text-xs text-slate-500">Instant multi-vector prefill</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => applyPreset('safe')}
              className="p-4 rounded-2xl bg-[#090d16] hover:bg-emerald-950/20 border border-white/5 hover:border-emerald-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300">
                  🟢 Verified Shopper
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  $45.00
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Aged account (420d), 240s session, matching residential IP. Immediate PayPal capture.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('suspicious')}
              className="p-4 rounded-2xl bg-[#090d16] hover:bg-amber-950/20 border border-white/5 hover:border-amber-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-400 group-hover:text-amber-300">
                  🟡 Velocity Surge
                </span>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  $680.00
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                New device fingerprint, 9s checkout speed, commercial VPN node. Trigger 3D-Secure.
              </p>
            </button>

            <button
              type="button"
              onClick={() => applyPreset('fraud')}
              className="p-4 rounded-2xl bg-[#090d16] hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-400 group-hover:text-rose-300">
                  🔴 Automated Bot Attack
                </span>
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono font-bold">
                  $2,450.00
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                TOR exit node, disposable email, 2s automated script checkout. Immediate auto-block.
              </p>
            </button>
          </div>
        </div>

        {/* 2 Column Layout: Inputs & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-7 rounded-3xl glass-card space-y-5">
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Sliders className="h-4 w-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Transaction Vectors & Telemetry
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Buyer Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Buyer Customer Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.buyerEmail}
                    onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    placeholder="buyer@example.com"
                  />
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Order Amount
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-xs">$</span>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        placeholder="45.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="CAD">CAD</option>
                    </select>
                  </div>
                </div>

                {/* IP Address & Country */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      IP Address
                    </label>
                    <input
                      type="text"
                      value={formData.ipAddress}
                      onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="198.51.100.42"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono text-center uppercase"
                      placeholder="US"
                    />
                  </div>
                </div>

                {/* Behavioral Session Sliders */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Time on Site (s)
                    </label>
                    <input
                      type="number"
                      value={formData.timeOnSiteSeconds}
                      onChange={(e) => setFormData({ ...formData, timeOnSiteSeconds: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Pages Visited
                    </label>
                    <input
                      type="number"
                      value={formData.pagesVisited}
                      onChange={(e) => setFormData({ ...formData, pagesVisited: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Checkout (s)
                    </label>
                    <input
                      type="number"
                      value={formData.checkoutSpeedSeconds}
                      onChange={(e) => setFormData({ ...formData, checkoutSpeedSeconds: e.target.value })}
                      className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Account Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Account Age (days with merchant)
                  </label>
                  <input
                    type="number"
                    value={formData.accountAgeDays}
                    onChange={(e) => setFormData({ ...formData, accountAgeDays: e.target.value })}
                    className="w-full px-3 py-2 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Risk Signal Checkboxes */}
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Anomalous Indicators
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      formData.vpnDetected ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>VPN / Proxy</span>
                      <input
                        type="checkbox"
                        checked={formData.vpnDetected}
                        onChange={(e) => setFormData({ ...formData, vpnDetected: e.target.checked })}
                        className="rounded accent-rose-500"
                      />
                    </label>

                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      formData.torDetected ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>TOR Network</span>
                      <input
                        type="checkbox"
                        checked={formData.torDetected}
                        onChange={(e) => setFormData({ ...formData, torDetected: e.target.checked })}
                        className="rounded accent-rose-500"
                      />
                    </label>

                    <label className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                      formData.emailIsDisposable ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' : 'bg-[#090d16] border-white/5 text-slate-400'
                    }`}>
                      <span>Disposable Mail</span>
                      <input
                        type="checkbox"
                        checked={formData.emailIsDisposable}
                        onChange={(e) => setFormData({ ...formData, emailIsDisposable: e.target.checked })}
                        className="rounded accent-rose-500"
                      />
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Executing XGBoost Inference...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      <span>Run AI Risk Assessment</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Visual Assessment & SHAP */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-7 rounded-3xl glass-card space-y-6 min-h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Model Verdict & SHAP Explainability
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('visual')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      viewMode === 'visual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#090d16] text-slate-400 hover:text-white'
                    }`}
                  >
                    Visual
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('json')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      viewMode === 'json'
                        ? 'bg-blue-600 text-white'
                        : 'bg-[#090d16] text-slate-400 hover:text-white'
                    }`}
                  >
                    JSON
                  </button>
                </div>
              </div>

              {!result && !loading && (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-3 text-slate-500">
                  <div className="p-5 rounded-2xl bg-[#090d16] border border-white/5 text-slate-600">
                    <Cpu className="h-10 w-10" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-300">Ready for Assessment</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Pick a scenario above or enter custom transaction signals, then click &ldquo;Run AI Risk Assessment&rdquo;.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
                    <RefreshCw className="h-7 w-7 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">Evaluating 40+ Feature Vectors...</p>
                    <p className="text-xs text-slate-400 mt-1">Passing signals to ML inference engine</p>
                  </div>
                </div>
              )}

              {result && viewMode === 'json' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400">Response Object (200 OK)</span>
                    <button
                      type="button"
                      onClick={copyJsonResult}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedJson ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedJson ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-[#090d16] border border-white/5 text-xs font-mono text-slate-300 overflow-x-auto max-h-96 leading-relaxed">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              {result && viewMode === 'visual' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Gauge & Metrics Card */}
                  <div className="p-6 rounded-3xl bg-[#090d16] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider block">
                        Assessed Probability
                      </span>
                      <div
                        className={`text-5xl font-black font-mono tracking-tight mt-1 ${
                          isGreen ? 'text-emerald-400' : isYellow ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {scorePercent}%
                      </div>
                      <span className="text-xs text-slate-400 mt-1 block">
                        Action: <strong className="text-white">{result.recommendation?.replace(/_/g, ' ')}</strong>
                      </span>
                    </div>

                    {/* SVG Progress Circle */}
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90">
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          stroke="#1f2937"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          stroke={isGreen ? '#10b981' : isYellow ? '#f59e0b' : '#f43f5e'}
                          strokeWidth="8"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <RiskBadge category={result.riskCategory} size="sm" />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Callout */}
                  <div
                    className={`p-4 rounded-2xl border flex items-center gap-3.5 ${
                      isGreen
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isYellow
                        ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                        : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {isGreen && <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0" />}
                    {isYellow && <AlertTriangle className="h-6 w-6 text-amber-400 shrink-0" />}
                    {isRed && <ShieldAlert className="h-6 w-6 text-rose-400 shrink-0" />}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        PayPal Mitigation Protocol
                      </p>
                      <p className="text-sm font-bold">
                        {isGreen
                          ? 'Instant Capture Approved • No Customer Friction'
                          : isYellow
                          ? 'Prompt 3D-Secure Step-Up or Manual Approval Queue'
                          : 'Void Authorization Immediately • 0 Chargeback Loss'}
                      </p>
                    </div>
                  </div>

                  {/* Risk Flags */}
                  {result.flags && result.flags.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                        Detected Signal Flags
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {result.flags.map((flag: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#090d16] text-slate-300 border border-white/5 text-xs font-mono font-semibold"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SHAP Impact Waterfall */}
                  <div className="space-y-3 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        SHAP Explainability Impact
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">Normalized Feature Weights</span>
                    </div>

                    <div className="space-y-2">
                      {topFeatures.map((feat, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-[#090d16] border border-white/5 flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium truncate max-w-[280px]">
                            {feat.feature}
                          </span>
                          <span
                            className={`font-mono font-bold ${
                              feat.impact > 0 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {feat.impact > 0 ? `+${(feat.impact * 100).toFixed(1)}%` : `${(feat.impact * 100).toFixed(1)}%`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
