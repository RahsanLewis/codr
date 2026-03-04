import React, { useEffect, useMemo, useRef, useState } from 'react'

interface TypingBoxProps {
  className?: string
}

const TypingBox: React.FC<TypingBoxProps> = ({ className }) => {
  const targetSentence = 'it is ready'
  const inputRef = useRef<HTMLDivElement>(null)
  const [typedValue, setTypedValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const normalizeChar = (value: string): string => value.toLowerCase()

  const isComplete = useMemo(() => {
    if (typedValue.length !== targetSentence.length) {
      return false
    }

    for (let i = 0; i < targetSentence.length; i += 1) {
      if (normalizeChar(typedValue[i]) !== normalizeChar(targetSentence[i])) {
        return false
      }
    }

    return true
  }, [targetSentence, typedValue])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return
    }

    if (event.key === 'Backspace') {
      event.preventDefault()
      setTypedValue((prev) => prev.slice(0, -1))
      return
    }

    if (event.key.length === 1) {
      event.preventDefault()
      setTypedValue((prev) =>
        prev.length < targetSentence.length ? `${prev}${event.key}` : prev
      )
    }
  }

  return (
    <section
      className={`w-full max-w-3xl rounded-2xl border border-cyan-300/20 bg-white/[0.03] p-8 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] ${className ?? ''}`}
    >
      <h1 className="text-center text-4xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-300 to-teal-300">
        Codr
      </h1>

      <p className="mt-6 text-center text-cyan-100/80">{targetSentence}</p>

      <div
        ref={inputRef}
        tabIndex={0}
        role="textbox"
        aria-label="Typing box"
        aria-live="polite"
        aria-multiline="false"
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
        {Array.from(targetSentence).map((char, index) => {
          let charClass = 'text-cyan-100/35'
          if (index < typedValue.length) {
            charClass =
              normalizeChar(typedValue[index]) === normalizeChar(char)
                ? 'text-emerald-400'
                : 'text-rose-400'
          }

          return (
            <span key={`char-${index}`} className={charClass}>
              {char}
            </span>
          )
        })}
      </div>

      <p className="mt-3 text-center text-sm text-cyan-100/70">
        Accuracy:{' '}
        {typedValue.length === 0
          ? '100%'
          : `${Math.round(
              (Array.from(typedValue).filter(
                (typedChar, index) =>
                  normalizeChar(typedChar) === normalizeChar(targetSentence[index] ?? '')
              ).length /
                typedValue.length) *
                100
            )}%`}
      </p>

      {isComplete ? (
        <p className="mt-4 text-center text-lg font-semibold text-emerald-400">
          great job
        </p>
      ) : null}
    </section>
  )
}

export default TypingBox
