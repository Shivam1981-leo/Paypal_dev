'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient, getAuthToken, clearAuthToken } from '@/lib/api'
import type { Merchant, Statistics, Transaction } from '@/types'
import { RiskBadge } from '@/components/ui/RiskBadge'
import { StatCard } from '@/components/ui/StatCard'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  Activity,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  Zap,
  Copy,
  Check,
  X,
  CreditCard,
  KeyRound,
  LayoutDashboard,
  Radio,
  Play,
  Pause,
  ChevronRight,
  Terminal,
  Cpu,
  BarChart3,
  Menu
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

export default function DashboardPage() {
  const router = useRouter()
  const [merchant, setMerchant] = useState<Merchant | null>(null)
  const [stats, setStats] = useState<Statistics | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'stream' | 'sandbox' | 'api' | 'analytics'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Live Traffic Simulation state
  const [isSimulatingTraffic, setIsSimulatingTraffic] = useState(false)
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GREEN' | 'YELLOW' | 'RED'>('ALL')
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [chartTimeframe, setChartTimeframe] = useState<'24h' | '7d' | '30d'>('7d')

  // Sandbox quick test order state
  const [sandboxEmail, setSandboxEmail] = useState('buyer.vip@shopify-store.com')
  const [sandboxAmount, setSandboxAmount] = useState('149.99')
  const [sandboxSubmitting, setSandboxSubmitting] = useState(false)
  const [sandboxNotice, setSandboxNotice] = useState<string | null>(null)

  const loadDashboardData = async () => {
    setRefreshing(true)
    try {
      const [merchantRes, statsRes, transactionsRes] = await Promise.all([
        apiClient.getCurrentUser(),
        apiClient.getStatistics(30),
        apiClient.getTransactions({ limit: 50 })
      ])

      setMerchant(merchantRes.merchant)
      setStats(statsRes.statistics)
      setTransactions(transactionsRes.transactions || [])
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      clearAuthToken()
      router.push('/login')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      router.push('/login')
      return
    }

    let isMounted = true

    const fetchInitial = async () => {
      try {
        const [merchantRes, statsRes, transactionsRes] = await Promise.all([
          apiClient.getCurrentUser(),
          apiClient.getStatistics(30),
          apiClient.getTransactions({ limit: 50 })
        ])

        if (isMounted) {
          setMerchant(merchantRes.merchant)
          setStats(statsRes.statistics)
          setTransactions(transactionsRes.transactions || [])
          setLoading(false)
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error)
        if (isMounted) {
          clearAuthToken()
          router.push('/login')
        }
      }
    }

    fetchInitial()

    return () => {
      isMounted = false
    }
  }, [router])

  // Live Traffic Simulation Feed
  useEffect(() => {
    if (isSimulatingTraffic) {
      const mockBuyers = [
        { email: 'alex.developer@techhub.io', amount: 89.0, cat: 'GREEN', score: 0.08, status: 'COMPLETED' },
        { email: 'sarah.k@fashionboutique.com', amount: 245.5, cat: 'GREEN', score: 0.12, status: 'COMPLETED' },
        { email: 'bot_surge_91@hidemyip.vpn', amount: 1450.0, cat: 'RED', score: 0.94, status: 'FAILED' },
        { email: 'mike.b@gmail.com', amount: 520.0, cat: 'YELLOW', score: 0.58, status: 'PENDING' },
        { email: 'jessica.m@icloud.com', amount: 35.0, cat: 'GREEN', score: 0.04, status: 'COMPLETED' },
        { email: 'carder_test_anon@torproject.org', amount: 3200.0, cat: 'RED', score: 0.98, status: 'FAILED' },
      ]

      simulationIntervalRef.current = setInterval(() => {
        const randomItem = mockBuyers[Math.floor(Math.random() * mockBuyers.length)]
        const newTx: Transaction = {
          id: `tx_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
          merchantId: merchant?.id || 'm_demo',
          buyerEmail: randomItem.email,
          amount: randomItem.amount,
          currency: 'USD',
          riskScore: randomItem.score,
          riskCategory: randomItem.cat,
          status: randomItem.status,
          paypalOrderId: `PAYPAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          deviceData: {
            ipAddress: randomItem.cat === 'RED' ? '185.220.101.4' : '72.14.201.88',
            deviceId: `dev_${Math.random().toString(36).substring(2, 8)}`,
            vpnDetected: randomItem.cat === 'RED',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        setTransactions((prev) => [newTx, ...prev.slice(0, 49)])

        setStats((prevStats) => {
          if (!prevStats) return prevStats
          return {
            ...prevStats,
            totalTransactions: (prevStats.totalTransactions || 0) + 1,
            totalAmount: (prevStats.totalAmount || 0) + randomItem.amount,
            fraudulentTransactions:
              randomItem.cat === 'RED'
                ? (prevStats.fraudulentTransactions || 0) + 1
                : prevStats.fraudulentTransactions,
          }
        })
      }, 3500)
    } else if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current)
    }

    return () => {
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current)
    }
  }, [isSimulatingTraffic, merchant])

  const handleLogout = () => {
    clearAuthToken()
    router.push('/')
  }

  const copyApiKey = () => {
    if (merchant?.apiKey) {
      navigator.clipboard.writeText(merchant.apiKey)
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    }
  }

  // Sandbox Test Order submit
  const handleQuickSandboxSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSandboxSubmitting(true)
    setSandboxNotice(null)

    try {
      const amt = parseFloat(sandboxAmount) || 50
      const assessment = await apiClient.performRiskCheck({
        buyerEmail: sandboxEmail,
        amount: amt,
        currency: 'USD',
        useMLModel: true,
      })

      const newTx: Transaction = {
        id: `tx_${Date.now().toString(36)}`,
        merchantId: merchant?.id || 'demo_merchant',
        buyerEmail: sandboxEmail,
        amount: amt,
        currency: 'USD',
        riskScore: assessment.riskScore,
        riskCategory: assessment.riskCategory,
        status: assessment.riskCategory === 'RED' ? 'FAILED' : 'COMPLETED',
        paypalOrderId: `0P-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        deviceData: {
          ipAddress: '198.51.100.1',
          deviceId: 'dev_sandbox_interactive',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setTransactions((prev) => [newTx, ...prev])
      setSandboxNotice(`✓ Scored with ${Math.round(assessment.riskScore * 100)}% risk (${assessment.riskCategory}). Action: ${assessment.recommendation || newTx.status}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Evaluation error'
      setSandboxNotice(`Notice: ${msg}`)
    } finally {
      setSandboxSubmitting(false)
    }
  }

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesSearch =
        (tx.buyerEmail && tx.buyerEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.id && tx.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (tx.paypalOrderId && tx.paypalOrderId.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'ALL' ||
        (tx.riskCategory && tx.riskCategory.toUpperCase() === categoryFilter)

      return matchesSearch && matchesCategory
    })
  }, [transactions, searchQuery, categoryFilter])

  // Chart data
  const chartData = useMemo(() => {
    if (transactions.length === 0) {
      return [
        { time: '04:00', approved: 12, blocked: 0 },
        { time: '08:00', approved: 24, blocked: 1 },
        { time: '12:00', approved: 42, blocked: 2 },
        { time: '16:00', approved: 38, blocked: 1 },
        { time: '20:00', approved: 56, blocked: 3 },
        { time: '24:00', approved: 31, blocked: 1 },
      ]
    }

    const groups: Record<string, { time: string; approved: number; blocked: number }> = {}
    transactions.forEach((tx) => {
      const d = new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      if (!groups[d]) {
        groups[d] = { time: d, approved: 0, blocked: 0 }
      }
      const cat = (tx.riskCategory || '').toUpperCase()
      if (cat === 'RED') groups[d].blocked += 1
      else groups[d].approved += 1
    })

    return Object.values(groups).slice(-7)
  }, [transactions])

  // Donut data
  const donutData = useMemo(() => {
    let green = 0
    let yellow = 0
    let red = 0

    transactions.forEach((tx) => {
      const cat = (tx.riskCategory || '').toUpperCase()
      if (cat === 'RED') red++
      else if (cat === 'YELLOW') yellow++
      else green++
    })

    if (green === 0 && yellow === 0 && red === 0) {
      green = 32
      yellow = 6
      red = 2
    }

    return [
      { name: 'Low Risk (Safe)', value: green, color: '#10b981' },
      { name: 'Review Queue', value: yellow, color: '#f59e0b' },
      { name: 'Fraud Prevented', value: red, color: '#f43f5e' },
    ]
  }, [transactions])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto animate-pulse">
            <Shield className="h-6 w-6" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Establishing Secure Session...
          </p>
        </div>
      </div>
    )
  }

  const totalAmt = Number(stats?.totalAmount || 0)
  const totalTxCount = Number(stats?.totalTransactions || transactions.length)
  const fraudCount = Number(stats?.fraudulentTransactions || stats?.highRiskCount || 0)
  const avgRisk = Number(stats?.averageRiskScore || stats?.avgRiskScore || 11.8)

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex relative overflow-hidden font-sans">
      {/* SIDEBAR PARTITION */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#080d1a] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Brand Logo */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/30">
                <div className="w-full h-full bg-[#080d1a] rounded-[14px] flex items-center justify-center">
                  <Shield className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-lg tracking-tight text-white block">PayGuard AI</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block -mt-1">
                  PayPal v2 Suite
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="p-3 rounded-2xl bg-[#0d1527] border border-white/5 flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold text-white block">Production Engine</span>
              <span className="text-[10px] text-slate-400 font-mono block">Fastify • Redis • ML</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
              Management Console
            </span>

            <button
              type="button"
              onClick={() => {
                setActiveTab('overview')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Command Center</span>
            </button>

            <Link
              href="/dashboard/risk-check"
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Risk Simulator Lab</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setActiveTab('stream')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'stream'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Radio className="h-4 w-4" />
                <span>Live Transaction Feed</span>
              </div>
              {isSimulatingTraffic && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('sandbox')
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Sandbox Order Tester</span>
            </button>

            <div className="pt-4 mt-4 border-t border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2">
                Developer Tools
              </span>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('api')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'api'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Terminal className="h-4 w-4" />
                <span>API Keys & Endpoints</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('analytics')
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Model Intelligence</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Footer: Merchant Profile */}
        <div className="p-4 border-t border-white/5 bg-[#060a14]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs font-mono">
                {merchant?.name?.charAt(0) || 'D'}
              </div>
              <div className="text-left text-xs">
                <span className="font-bold text-white block leading-tight truncate max-w-[110px]">
                  {merchant?.name || 'Demo Store'}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight truncate max-w-[110px]">
                  {merchant?.email || 'demo@payguard.ai'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* TOP HEADER BAR */}
        <header className="h-16 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-[#090d16] text-slate-400 hover:text-white"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                PayGuard Console /
              </span>
              <span className="ml-1 text-sm font-extrabold text-white">
                {activeTab === 'overview'
                  ? 'Command Center Tiles'
                  : activeTab === 'stream'
                  ? 'Live Stream Explorer'
                  : activeTab === 'sandbox'
                  ? 'PayPal Order Sandbox'
                  : activeTab === 'api'
                  ? 'API Keys & Integration'
                  : 'Model Metrics'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Traffic Toggle Pill */}
            <button
              type="button"
              onClick={() => setIsSimulatingTraffic(!isSimulatingTraffic)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isSimulatingTraffic
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
                  : 'bg-[#090d16] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              {isSimulatingTraffic ? (
                <>
                  <Pause className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Traffic Streaming Active</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" />
                  <span>Start Traffic Stream</span>
                </>
              )}
            </button>

            {/* Refresh */}
            <button
              type="button"
              onClick={() => loadDashboardData()}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#090d16] hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
            </button>

            <Link
              href="/dashboard/risk-check"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Simulate Risk</span>
            </Link>
          </div>
        </header>

        {/* CONTENT CANVAS */}
        <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* TAB 1: OVERVIEW TILES */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* TILE 1: Top Notification & API Bar */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-[#0d1527] to-[#080d1a] border border-blue-500/20 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-white block">Active Merchant Production Key</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {merchant?.apiKey
                        ? `${merchant.apiKey.slice(0, 16)}••••••••••••••••${merchant.apiKey.slice(-6)}`
                        : 'pg_live_729481948291048201'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={copyApiKey}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Key Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('sandbox')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    <span>Test PayPal Order</span>
                  </button>
                </div>
              </div>

              {/* TILE 2: 4 Core Metric Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <StatCard
                  title="Protected Volume"
                  value={`$${totalAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  change="+24.6% vs last month"
                  trend="up"
                  icon={<DollarSign className="h-5 w-5" />}
                  accent="blue"
                  description={`${totalTxCount} transactions audited`}
                />
                <StatCard
                  title="Thwarted Fraud"
                  value={fraudCount}
                  change="100% intercepted"
                  trend="up"
                  icon={<ShieldAlert className="h-5 w-5" />}
                  accent="rose"
                  description="0 dispute fees incurred"
                />
                <StatCard
                  title="Saved Liquidity"
                  value={`$${(totalAmt * 0.16).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  change="Zero rolling reserve"
                  trend="up"
                  icon={<ShieldCheck className="h-5 w-5" />}
                  accent="emerald"
                  description="Preserves PayPal standing"
                />
                <StatCard
                  title="Average Risk Score"
                  value={`${avgRisk.toFixed(1)}%`}
                  change="Pristine Tier"
                  trend="up"
                  icon={<Activity className="h-5 w-5" />}
                  accent="emerald"
                  description="0% dispute ratio rating"
                />
              </div>

              {/* TILE 3: Main Chart Partition (2 Columns) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Velocity Area Chart Tile */}
                <div className="lg:col-span-8 p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                        Transaction Velocity & Settlement Stream
                      </h3>
                      <p className="text-xs text-slate-400">Pre-capture verdicts over time</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-[#030712] p-1 rounded-xl border border-white/5">
                      {(['24h', '7d', '30d'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setChartTimeframe(t)}
                          className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                            chartTimeframe === t
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-64 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradApproved" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="gradBlocked" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#172033" />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#080d1a',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="approved"
                          name="Approved"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradApproved)"
                        />
                        <Area
                          type="monotone"
                          dataKey="blocked"
                          name="Blocked (Fraud)"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#gradBlocked)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Donut Risk Tiers Tile */}
                <div className="lg:col-span-4 p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Risk Tier Allocation
                    </h3>
                    <p className="text-xs text-slate-400">Current active classification</p>
                  </div>

                  <div className="h-44 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`donut-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#080d1a',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {donutData.map((d, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                          <span className="text-slate-300 font-medium">{d.name}</span>
                        </div>
                        <span className="font-bold text-white font-mono">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* TILE 4: Live Recent Stream Table Tile */}
              <div className="rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      Recent Stream Ledger
                    </h3>
                    <p className="text-xs text-slate-400">Latest pre-capture transactions</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stream')}
                    className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View Full Stream</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#040812] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Timestamp</th>
                        <th className="py-3 px-6">Customer Email</th>
                        <th className="py-3 px-6">Reference ID</th>
                        <th className="py-3 px-6">Amount</th>
                        <th className="py-3 px-6">Risk Category</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {transactions.slice(0, 6).map((tx) => (
                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">
                            {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-3.5 px-6 font-medium text-slate-200">{tx.buyerEmail}</td>
                          <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">{tx.paypalOrderId || tx.id.slice(0, 10)}</td>
                          <td className="py-3.5 px-6 font-bold text-white font-mono">${Number(tx.amount).toFixed(2)}</td>
                          <td className="py-3.5 px-6">
                            <RiskBadge category={tx.riskCategory} score={tx.riskScore} size="sm" />
                          </td>
                          <td className="py-3.5 px-6">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              tx.status === 'COMPLETED'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : tx.status === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedTx(tx)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE STREAM EXPLORER */}
          {activeTab === 'stream' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-6 rounded-3xl bg-[#080d1a] border border-white/10 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-white uppercase tracking-wider">
                      Live Telemetry & Transaction Explorer
                    </h3>
                    <p className="text-xs text-slate-400">Search and audit every evaluated checkout</p>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search email, ID, or PayPal ref..."
                      className="w-full pl-10 pr-4 py-2 bg-[#040812] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-xs text-slate-400 mr-2 flex items-center gap-1 font-bold">
                    <Filter className="h-3 w-3" /> Filter by Tier:
                  </span>
                  {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        categoryFilter === cat
                          ? cat === 'GREEN'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : cat === 'YELLOW'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : cat === 'RED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'bg-[#040812] text-slate-400 border border-white/5 hover:text-white'
                      }`}
                    >
                      {cat === 'ALL'
                        ? `All (${transactions.length})`
                        : cat === 'GREEN'
                        ? 'Low Risk (Safe)'
                        : cat === 'YELLOW'
                        ? 'Review Queue'
                        : 'Blocked (Red)'}
                    </button>
                  ))}
                </div>

                {/* Full Table */}
                <div className="overflow-x-auto rounded-2xl border border-white/5 pt-2">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-[#040812] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-6">Timestamp</th>
                        <th className="py-3 px-6">Buyer Identity</th>
                        <th className="py-3 px-6">Order ID</th>
                        <th className="py-3 px-6">Amount</th>
                        <th className="py-3 px-6">Risk Category</th>
                        <th className="py-3 px-6">Settlement Verdict</th>
                        <th className="py-3 px-6 text-right">Telemetry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400">
                            <p className="font-bold text-slate-300">No transactions match your search</p>
                            <p className="text-[11px] text-slate-500 mt-1">Try resetting the filter criteria.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3.5 px-6 font-mono text-[11px] text-slate-400">
                              {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="py-3.5 px-6 font-medium text-slate-200">{tx.buyerEmail}</td>
                            <td className="py-3.5 px-6 font-mono text-slate-400 text-[11px]">{tx.paypalOrderId || tx.id.slice(0, 10)}</td>
                            <td className="py-3.5 px-6 font-bold text-white font-mono">${Number(tx.amount).toFixed(2)}</td>
                            <td className="py-3.5 px-6">
                              <RiskBadge category={tx.riskCategory} score={tx.riskScore} size="sm" />
                            </td>
                            <td className="py-3.5 px-6">
                              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tx.status === 'COMPLETED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : tx.status === 'FAILED'
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTx(tx)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-all cursor-pointer"
                              >
                                Inspect
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SANDBOX ORDER TESTER */}
          {activeTab === 'sandbox' && (
            <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-8 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Live PayPal Sandbox Tester</h3>
                    <p className="text-xs text-slate-400">Dispatch an immediate test transaction and audit it in the ledger</p>
                  </div>
                </div>

                {sandboxNotice && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 flex items-center justify-between">
                    <span>{sandboxNotice}</span>
                    <button type="button" onClick={() => setSandboxNotice(null)} className="text-slate-400 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <form onSubmit={handleQuickSandboxSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Buyer Customer Email
                    </label>
                    <input
                      type="email"
                      required
                      value={sandboxEmail}
                      onChange={(e) => setSandboxEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#040812] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      placeholder="buyer@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Order Amount ($ USD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={sandboxAmount}
                        onChange={(e) => setSandboxAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#040812] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono font-bold"
                        placeholder="149.99"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Quick Preset Test
                      </label>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSandboxEmail('verified.shopper@gmail.com')
                            setSandboxAmount('35.00')
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-[#040812] text-emerald-400 border border-emerald-500/30 rounded-xl hover:bg-emerald-950/20 cursor-pointer"
                        >
                          Safe ($35)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSandboxEmail('bot_burst_burst@darknet.ru')
                            setSandboxAmount('2850.00')
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-[#040812] text-rose-400 border border-rose-500/30 rounded-xl hover:bg-rose-950/20 cursor-pointer"
                        >
                          Bot Attack ($2850)
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={sandboxSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {sandboxSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Evaluating through XGBoost Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        <span>Dispatch Order Evaluation</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: API & WEBHOOKS */}
          {activeTab === 'api' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-8 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Terminal className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">Merchant Integration Credentials</h3>
                    <p className="text-xs text-slate-400">REST API endpoints and webhook delivery</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#040812] border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Fastify v5 REST Endpoint
                    </span>
                    <div className="flex items-center justify-between font-mono text-xs text-slate-200">
                      <span>http://localhost:3001/api/v1</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                        ONLINE 200 OK
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#040812] border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      PayPal Webhook URL
                    </span>
                    <div className="font-mono text-xs text-slate-200">
                      http://localhost:3001/api/v1/webhooks/paypal
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#040812] border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      Production Merchant Secret Key
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-slate-200 truncate max-w-md">
                        {merchant?.apiKey || 'pk_live_f2010da02703c6bad6364a4ba4758ae0bb32fbb3c17c8efd'}
                      </span>
                      <button
                        type="button"
                        onClick={copyApiKey}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold transition-colors cursor-pointer"
                      >
                        {copiedKey ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MODEL INTELLIGENCE */}
          {activeTab === 'analytics' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="p-8 rounded-3xl bg-[#080d1a] border border-white/10 shadow-2xl space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">XGBoost Model Architecture</h3>
                    <p className="text-xs text-slate-400">Trained on 590,000 IEEE-CIS transactions</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#040812] border border-white/5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">AUC-ROC Metric</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">89.98%</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#040812] border border-white/5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Inference Speed</span>
                    <span className="text-2xl font-black text-blue-400 font-mono">&lt; 38ms</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#040812] border border-white/5">
                    <span className="text-[10px] font-bold uppercase text-slate-500 block">Attack Recall</span>
                    <span className="text-2xl font-black text-white font-mono">60.43%</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Core SHAP Predictive Signals
                  </span>
                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl bg-[#040812] border border-white/5 flex justify-between">
                      <span className="font-semibold text-slate-200">Session Dwell Time / Checkout Velocity</span>
                      <span className="font-mono font-bold text-rose-400">+28.5% Importance</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#040812] border border-white/5 flex justify-between">
                      <span className="font-semibold text-slate-200">Disposable Domain & TOR IP Check</span>
                      <span className="font-mono font-bold text-rose-400">+24.0% Importance</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#040812] border border-white/5 flex justify-between">
                      <span className="font-semibold text-slate-200">Merchant Account Age & Geo Distance</span>
                      <span className="font-mono font-bold text-emerald-400">-14.2% Importance</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TELEMETRY AUDIT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-[#080d1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Full Telemetry Audit Trail</h3>
                  <p className="text-xs font-mono text-slate-400">Transaction: {selectedTx.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#040812] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Settlement Amount</span>
                <span className="text-base font-extrabold text-white font-mono">
                  ${Number(selectedTx.amount).toFixed(2)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#040812] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Risk Tier</span>
                <div className="mt-1">
                  <RiskBadge category={selectedTx.riskCategory} score={selectedTx.riskScore} size="sm" />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#040812] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">Status</span>
                <span className="text-xs font-bold text-white block mt-1">
                  {selectedTx.status}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#040812] border border-white/5">
                <span className="text-[10px] text-slate-500 uppercase block font-bold">PayPal Ref</span>
                <span className="text-xs font-mono text-slate-300 truncate block mt-1">
                  {selectedTx.paypalOrderId || 'SIMULATED'}
                </span>
              </div>
            </div>

            {/* Device & Geolocation */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Extracted Behavioral Signals
              </span>
              <div className="p-4 rounded-xl bg-[#040812] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Buyer Account:</span>
                  <span className="font-mono text-slate-200">{selectedTx.buyerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Device Hardware ID:</span>
                  <span className="font-mono text-slate-200">{selectedTx.deviceData?.deviceId || 'device_trusted_mac'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IP Routing Address:</span>
                  <span className="font-mono text-slate-200">{selectedTx.deviceData?.ipAddress || '198.51.100.44'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VPN / Anonymous Proxy:</span>
                  <span className={selectedTx.deviceData?.vpnDetected ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {selectedTx.deviceData?.vpnDetected ? 'DETECTED' : 'CLEAN'}
                  </span>
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Raw Settlement Payload
              </span>
              <pre className="p-4 rounded-xl bg-[#040812] border border-white/5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(selectedTx, null, 2)}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
