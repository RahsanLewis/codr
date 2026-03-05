import React, { useEffect, useMemo, useRef, useState } from 'react'
import Statistics from '../Statistics/Statistics'
import {
  CODING_CHALLENGES,
  pickRandomChallengeIndex
} from '../TextBank/TextBank'

interface TypingBoxProps {
  className?: string
}

const TypingBox: React.FC<TypingBoxProps> = ({ className }) => {
  const inputRef = useRef<HTMLDivElement>(null)
  const advanceTimeoutRef = useRef<number | null>(null)

  const initialChallengeIndex = pickRandomChallengeIndex([])
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(
    initialChallengeIndex ?? 0
  )
  const [usedChallengeIndexes, setUsedChallengeIndexes] = useState<number[]>([])

  const [typedValue, setTypedValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isPracticeComplete, setIsPracticeComplete] = useState(
    CODING_CHALLENGES.length === 0
  )
  const [isAdvancing, setIsAdvancing] = useState(false)

  const challenge = CODING_CHALLENGES[currentChallengeIndex]

  const challengeResult = useMemo(() => {
    if (!challenge) {
      return { isValid: false, checks: [] as { label: string; passed: boolean }[] }
    }

    return challenge.evaluate(typedValue)
  }, [challenge, typedValue])

  const isComplete = Boolean(challenge) && challengeResult.isValid

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!startTime) {
      return
    }

    if (isComplete || isPracticeComplete || isAdvancing) {
      const finalSeconds = Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000))
      setElapsedSeconds(finalSeconds)
      return
    }

    const timerId = window.setInterval(() => {
      const seconds = Math.max(0, Math.floor((Date.now() - startTime.getTime()) / 1000))
      setElapsedSeconds(seconds)
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [startTime, isComplete, isPracticeComplete, isAdvancing])

  const accuracy = useMemo(() => {
    if (typedValue.length === 0) {
      return 0
    }

    const totalChecks = challengeResult.checks.length
    if (totalChecks === 0) {
      return 0
    }

    const passedChecks = challengeResult.checks.filter((check) => check.passed).length
    return (passedChecks / totalChecks) * 100
  }, [typedValue, challengeResult])

  const speed = useMemo(() => {
    if (!startTime || typedValue.length === 0 || elapsedSeconds === 0) {
      return 0
    }

    const minutesElapsed = elapsedSeconds / 60
    return (typedValue.length / 5) / minutesElapsed
  }, [startTime, typedValue.length, elapsedSeconds])

  const resetCurrentAttempt = () => {
    setTypedValue('')
    setStartTime(null)
    setElapsedSeconds(0)
  }

  useEffect(() => {
    if (!challenge || !isComplete || isPracticeComplete || isAdvancing) {
      return
    }

    if (usedChallengeIndexes.includes(currentChallengeIndex)) {
      return
    }

    const nextUsed = [...usedChallengeIndexes, currentChallengeIndex]

    if (nextUsed.length >= CODING_CHALLENGES.length) {
      setUsedChallengeIndexes(nextUsed)
      setIsPracticeComplete(true)
      return
    }

    setIsAdvancing(true)

    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current)
    }

    advanceTimeoutRef.current = window.setTimeout(() => {
      const nextIndex = pickRandomChallengeIndex(nextUsed, CODING_CHALLENGES.length)
      setUsedChallengeIndexes(nextUsed)

      if (nextIndex !== null) {
        setCurrentChallengeIndex(nextIndex)
      }

      resetCurrentAttempt()
      setIsAdvancing(false)
      inputRef.current?.focus()
    }, 700)

    return () => {
      if (advanceTimeoutRef.current) {
        window.clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = null
      }
    }
  }, [
    challenge,
    isComplete,
    isPracticeComplete,
    usedChallengeIndexes,
    currentChallengeIndex
  ])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (isComplete || isAdvancing || isPracticeComplete) {
      event.preventDefault()
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      setTypedValue((prev) => prev.slice(0, -1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      return
    }

    if (event.key.length === 1) {
      event.preventDefault()
      setTypedValue((prev) => {
        if (prev.length === 0 && !startTime) {
          setStartTime(new Date())
          setElapsedSeconds(0)
        }

        return `${prev}${event.key}`
      })
    }
  }

  const handleReset = () => {
    if (advanceTimeoutRef.current) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }

    const nextIndex = pickRandomChallengeIndex([], CODING_CHALLENGES.length)
    if (nextIndex !== null) {
      setCurrentChallengeIndex(nextIndex)
    }

    setUsedChallengeIndexes([])
    setIsPracticeComplete(CODING_CHALLENGES.length === 0)
    setIsAdvancing(false)
    resetCurrentAttempt()
    inputRef.current?.focus()
  }

  const textStateClass = (() => {
    if (typedValue.length === 0) {
      return 'text-cyan-100/35'
    }

    if (isComplete) {
      return 'text-emerald-400'
    }

    return 'text-cyan-200/85'
  })()

  const missingFeatures = useMemo(() => {
    if (typedValue.length === 0 || isComplete) {
      return []
    }

    return challengeResult.checks
      .filter((check) => !check.passed)
      .map((check) => check.label)
  }, [typedValue, isComplete, challengeResult])

  const completedCount = Math.min(
    CODING_CHALLENGES.length,
    usedChallengeIndexes.length + (isPracticeComplete ? 1 : 0)
  )

  return (
    <section
      className={`w-full max-w-3xl rounded-2xl border border-cyan-300/20 bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] ${className ?? ''}`}
    >
      <h1 className="text-center text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-300 to-teal-300">
        Codr
      </h1>

      <p className="mt-3 text-center text-xs uppercase tracking-wide text-cyan-100/60">
        Coding Practice ({Math.min(completedCount + 1, CODING_CHALLENGES.length)}/{CODING_CHALLENGES.length})
      </p>

      <p className="mt-3 text-center text-cyan-100/90">
        {challenge ? challenge.instruction : 'No coding challenges available.'}
      </p>
      <p className="mt-1 text-center text-sm text-cyan-100/60">
        {challenge ? challenge.hint : 'Add challenges to the text bank.'}
      </p>

      <Statistics speed={speed} accuracy={accuracy} elapsedSeconds={elapsedSeconds} />

      <div
        ref={inputRef}
        tabIndex={0}
        role="textbox"
        aria-label="Typing box"
        aria-live="polite"
        aria-multiline="true"
        className={`mt-5 min-h-[88px] cursor-text rounded-xl border bg-black/25 px-5 py-4 font-mono text-2xl tracking-wide outline-none transition ${
          isFocused
            ? 'border-cyan-300/70 shadow-[0_0_18px_rgba(34,211,238,0.35)]'
            : 'border-cyan-300/25'
        }`}
        onPaste={(event) => event.preventDefault()}
        onKeyDown={handleKeyDown}
        onMouseDown={(event) => {
          event.preventDefault()
          inputRef.current?.focus()
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <span className={textStateClass}>{typedValue.length > 0 ? typedValue : challenge?.hint}</span>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        {isPracticeComplete ? (
          <p className="text-center text-lg font-semibold text-emerald-400">
            all practice completed
          </p>
        ) : isAdvancing ? (
          <p className="text-center text-sm text-cyan-100/70">great job, loading next practice...</p>
        ) : isComplete ? (
          <p className="text-center text-lg font-semibold text-emerald-400">
            great job
          </p>
        ) : (
          <div className="text-center text-sm text-cyan-100/65">
            <p>Complete the current coding practice prompt.</p>
            {missingFeatures.length > 0 ? (
              <p className="mt-1 text-cyan-200/80">
                Missing: {missingFeatures.join(', ')}
              </p>
            ) : null}
          </div>
        )}

        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-cyan-300/40 px-3 py-1.5 text-sm text-cyan-200 hover:bg-cyan-300/10"
        >
          Reset
        </button>
      </div>
    </section>
  )
}

export default TypingBox
