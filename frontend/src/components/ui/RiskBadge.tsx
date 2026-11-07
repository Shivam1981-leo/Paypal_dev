'use client'

import React from 'react'

interface RiskBadgeProps {
  category?: 'GREEN' | 'YELLOW' | 'RED' | string | null
  score?: number | string | null
  size?: 'sm' | 'md' | 'lg'
}

export function RiskBadge({ category, score, size = 'md' }: RiskBadgeProps) {
  const normCategory = (category || 'UNKNOWN').toUpperCase()

  let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
  let dotColor = 'bg-slate-400'
  let label = normCategory

  if (normCategory.includes('GREEN') || normCategory.includes('LOW') || normCategory.includes('SAFE')) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60'
    dotColor = 'bg-emerald-500 ring-2 ring-emerald-400/20'
    label = 'LOW RISK'
  } else if (normCategory.includes('YELLOW') || normCategory.includes('MEDIUM') || normCategory.includes('REVIEW')) {
    style = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60'
    dotColor = 'bg-amber-500 ring-2 ring-amber-400/20'
    label = 'SUSPICIOUS'
  } else if (normCategory.includes('RED') || normCategory.includes('HIGH') || normCategory.includes('BLOCK')) {
    style = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60'
    dotColor = 'bg-rose-500 ring-2 ring-rose-400/20'
    label = 'HIGH RISK'
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-xs font-semibold gap-2',
    lg: 'px-3 py-1.5 text-sm font-semibold gap-2.5'
  }

  const formattedScore = score !== undefined && score !== null
    ? typeof score === 'number'
      ? score <= 1 ? (score * 100).toFixed(0) : score.toFixed(0)
      : parseFloat(score) <= 1 ? (parseFloat(score) * 100).toFixed(0) : parseFloat(score).toFixed(0)
    : null

  return (
    <span
      className={`inline-flex items-center tracking-wide font-medium rounded-full border shadow-xs ${sizeClasses[size]} ${style}`}
    >
      <span className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
      {formattedScore && !isNaN(Number(formattedScore)) && (
        <span className="opacity-80 font-mono text-[0.85em]">({formattedScore}%)</span>
      )}
    </span>
  )
}
