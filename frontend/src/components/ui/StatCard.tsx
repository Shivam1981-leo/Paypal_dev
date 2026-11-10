'use client'

import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  description?: string
  accent?: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple'
}

export function StatCard({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  description,
  accent = 'blue'
}: StatCardProps) {
  const accentGradients = {
    blue: 'from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
    emerald: 'from-emerald-500/10 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
    amber: 'from-amber-500/10 to-yellow-500/5 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
    rose: 'from-rose-500/10 to-pink-500/5 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30',
    purple: 'from-purple-500/10 to-indigo-500/5 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30',
  }

  const iconBg = {
    blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/20',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
    amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
    rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 ring-1 ring-rose-500/20',
    purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 ring-1 ring-purple-500/20',
  }

  return (
    <div className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      <div className={`absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-gradient-to-br ${accentGradients[accent]} blur-2xl opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none`} />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className={`p-2.5 rounded-xl ${iconBg[accent]}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </div>
        {change && (
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : trend === 'down'
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {trend === 'up' ? '↑ ' : trend === 'down' ? '↓ ' : ''}
            {change}
          </span>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  )
}
