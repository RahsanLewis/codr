import React from 'react'

interface StatisticsProps {
  speed: number
  accuracy: number
  elapsedSeconds: number
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const Statistics: React.FC<StatisticsProps> = ({ speed, accuracy, elapsedSeconds }) => {
  return (
    <div className="mt-6 grid w-full gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-cyan-300/20 bg-black/20 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-cyan-100/70">Speed</p>
        <p className="mt-1 text-2xl font-semibold text-cyan-300">{speed.toFixed(1)} WPM</p>
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-black/20 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-cyan-100/70">Accuracy</p>
        <p className="mt-1 text-2xl font-semibold text-emerald-400">{accuracy.toFixed(1)}%</p>
      </div>

      <div className="rounded-xl border border-cyan-300/20 bg-black/20 px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-cyan-100/70">Timer</p>
        <p className="mt-1 text-2xl font-semibold text-cyan-200">{formatTime(elapsedSeconds)}</p>
      </div>
    </div>
  )
}

export default Statistics
