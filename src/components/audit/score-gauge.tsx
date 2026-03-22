'use client'
import { useEffect, useState } from 'react'
import { getScoreColor } from '@/lib/utils'

export function ScoreGauge({ score }: { score: number }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => { setTimeout(() => setAnimated(true), 100) }, [])

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const progress = animated ? (score / 100) * circumference : circumference
  const dashOffset = circumference - progress

  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="hsl(217 33% 15%)" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-bold ${getScoreColor(score)}`} style={{fontFamily:'Space Grotesk'}}>{score}</span>
      </div>
    </div>
  )
}
