'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient, setAuthToken } from '@/lib/api'
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  Gem,
  Gamepad2,
  Coffee,
  Cloud,
  Layers
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const presetMerchants = [
    {
      name: 'Demo Electronics',
      email: 'demo@payguard.ai',
      pass: 'Demo123!',
      category: 'Electronics',
      badge: 'High Vol',
      icon: ShoppingBag,
      color: 'from-blue-500/20 to-indigo-500/10 text-blue-400 border-blue-500/30'
    },
    {
      name: 'Nova Retail',
      email: 'test@example.com',
      pass: 'Test123!',
      category: 'Apparel',
      badge: 'Retail',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      name: 'Luxury Palace',
      email: 'fashion@luxurypalace.com',
      pass: 'Luxury123!',
      category: 'High-Ticket',
      badge: '$5K+ Orders',
      icon: Gem,
      color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30'
    },
    {
      name: 'GameVault Digital',
      email: 'support@gamingvouchers.io',
      pass: 'Gaming123!',
      category: 'Gaming / Keys',
      badge: 'Bot Target',
      icon: Gamepad2,
      color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30'
    },
    {
      name: 'EcoBean Coffee',
      email: 'orders@ecocoffee.co',
      pass: 'Coffee123!',
      category: 'Subscriptions',
      badge: '98% Safe',
      icon: Coffee,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30'
    },
    {
      name: 'CloudStack SaaS',
      email: 'dev@cloudstack.net',
      pass: 'Cloud123!',
      category: 'Dev Infra',
      badge: 'Enterprise',
      icon: Cloud,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-400 border-amber-500/30'
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await apiClient.login(formData.email, formData.password)
      setAuthToken(response.token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check your credentials.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const fillAndLogin = async (email: string, pass: string) => {
    setFormData({ email, password: pass })
    setError('')
    setLoading(true)
    try {
      const response = await apiClient.login(email, pass)
      setAuthToken(response.token)
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex items-center justify-center px-4 relative overflow-hidden bg-grid-pattern selection:bg-blue-600 selection:text-white py-12">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[140px] pointer-events-none" />

      <div className="max-w-xl w-full relative z-10 space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-xl shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">PayGuard AI</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Merchant Console Sign In</h1>
          <p className="text-xs text-slate-400">Access your pre-capture fraud telemetry, risk scores & PayPal controls</p>
        </div>

        {/* 1-Click Multi-Merchant Selector Tiles */}
        <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-200">Switch Merchant Workspace</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">1-Click Auto-Login</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {presetMerchants.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => fillAndLogin(m.email, m.pass)}
                  disabled={loading}
                  className={`p-2.5 rounded-xl border bg-gradient-to-br ${m.color} text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                      {m.badge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{m.email}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Login Form Card */}
        <div className="glass-card rounded-3xl p-7 shadow-2xl border border-white/10 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Merchant Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="demo@payguard.ai"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#090d16] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Merchant Console</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-3 border-t border-white/5 text-center">
            <p className="text-xs text-slate-400">
              Need a custom merchant account?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                Register Here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Strict Multi-Tenant Isolation • Argon2/Bcrypt Hash Security • End-to-End JWT Auth
        </div>
      </div>
    </div>
  )
}
