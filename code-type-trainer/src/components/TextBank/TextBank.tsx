import React from 'react'

export interface CodingChallenge {
  id: string
  instruction: string
  hint: string
  evaluate: (input: string) => {
    isValid: boolean
    checks: { label: string; passed: boolean }[]
  }
}

export interface VariableDeclarationCheck {
  hasName: boolean
  hasValidNameCharacters: boolean
  hasAssignment: boolean
  hasValue: boolean
  isValid: boolean
}

export interface PrintStatementCheck {
  hasFunctionStatement: boolean
  hasParentheses: boolean
  hasCommaSeparatedArguments: boolean
  isValid: boolean
}

export interface BooleanDeclarationCheck {
  hasNoTypeKeyword: boolean
  hasValidName: boolean
  hasSingleAssignment: boolean
  hasBooleanLiteral: boolean
  hasUnquotedBooleanValue: boolean
  hasNoSemicolon: boolean
  isValid: boolean
}

export interface ListDeclarationCheck {
  hasNoTypeKeyword: boolean
  hasValidName: boolean
  hasSingleAssignment: boolean
  hasSquareBrackets: boolean
  hasCommaSeparatedItems: boolean
  hasNoSemicolon: boolean
  isValid: boolean
}

export interface DictionaryDeclarationCheck {
  hasNoTypeKeyword: boolean
  hasValidName: boolean
  hasSingleAssignment: boolean
  hasCurlyBraces: boolean
  hasKeyValuePairs: boolean
  hasCommaSeparatedPairs: boolean
  hasHashableKeys: boolean
  hasNoSemicolon: boolean
  isValid: boolean
}

export const checkVariableDeclaration = (input: string): VariableDeclarationCheck => {
  const normalized = input.replace(/\n/g, '')
  const trimmed = normalized.trim()

  const assignmentIndex = trimmed.indexOf('=')
  const hasAssignment = assignmentIndex >= 0
  const leftSide = hasAssignment ? trimmed.slice(0, assignmentIndex).trim() : trimmed
  const rightSide = hasAssignment ? trimmed.slice(assignmentIndex + 1).trim() : ''

  const hasName = leftSide.length > 0
  const hasValidNameCharacters = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(leftSide)
  const hasValue = rightSide.length > 0

  const isValid =
    hasName &&
    hasValidNameCharacters &&
    hasAssignment &&
    hasValue

  return {
    hasName,
    hasValidNameCharacters,
    hasAssignment,
    hasValue,
    isValid
  }
}

export const checkPrintStatement = (input: string): PrintStatementCheck => {
  const normalized = input.replace(/\n/g, '')
  const trimmed = normalized.trim()

  const hasFunctionStatement = /^print\b/u.test(trimmed)
  const parenthesisMatch = /^print\s*\((.*)\)\s*$/u.exec(trimmed)
  const hasParentheses = parenthesisMatch !== null

  let hasCommaSeparatedArguments = false
  if (parenthesisMatch) {
    const inside = parenthesisMatch[1].trim()
    if (inside.length === 0) {
      hasCommaSeparatedArguments = true
    } else {
      const parts = inside.split(',')
      hasCommaSeparatedArguments = parts.every((part) => part.trim().length > 0)
    }
  }

  const isValid =
    hasFunctionStatement &&
    hasParentheses &&
    hasCommaSeparatedArguments

  return {
    hasFunctionStatement,
    hasParentheses,
    hasCommaSeparatedArguments,
    isValid
  }
}

export const checkBooleanDeclaration = (input: string): BooleanDeclarationCheck => {
  const normalized = input.replace(/\n/g, '')
  const trimmed = normalized.trim()

  const hasNoTypeKeyword = !/^(?:bool|let|var|const)\s+[A-Za-z_]/u.test(trimmed)
  const hasNoSemicolon = !/;\s*$/u.test(trimmed)
  const hasSingleAssignment =
    (trimmed.match(/=/g)?.length ?? 0) === 1 &&
    !/(?:==|!=|<=|>=)/u.test(trimmed)

  const assignmentIndex = trimmed.indexOf('=')
  const leftSide = assignmentIndex >= 0 ? trimmed.slice(0, assignmentIndex).trim() : ''
  const rightSide = assignmentIndex >= 0 ? trimmed.slice(assignmentIndex + 1).trim() : ''

  const hasValidName = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(leftSide)
  const hasBooleanLiteral = /^(?:True|False)$/u.test(rightSide)
  const hasUnquotedBooleanValue = !/^['"].*['"]$/u.test(rightSide)

  const isValid =
    hasNoTypeKeyword &&
    hasValidName &&
    hasSingleAssignment &&
    hasBooleanLiteral &&
    hasUnquotedBooleanValue &&
    hasNoSemicolon

  return {
    hasNoTypeKeyword,
    hasValidName,
    hasSingleAssignment,
    hasBooleanLiteral,
    hasUnquotedBooleanValue,
    hasNoSemicolon,
    isValid
  }
}

const splitTopLevelByComma = (value: string): string[] | null => {
  const segments: string[] = []
  let current = ''

  let bracketDepth = 0
  let braceDepth = 0
  let parenDepth = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let isEscaping = false

  for (const char of value) {
    if (isEscaping) {
      current += char
      isEscaping = false
      continue
    }

    if ((inSingleQuote || inDoubleQuote) && char === '\\') {
      current += char
      isEscaping = true
      continue
    }

    if (inSingleQuote) {
      current += char
      if (char === "'") {
        inSingleQuote = false
      }
      continue
    }

    if (inDoubleQuote) {
      current += char
      if (char === '"') {
        inDoubleQuote = false
      }
      continue
    }

    if (char === "'") {
      inSingleQuote = true
      current += char
      continue
    }

    if (char === '"') {
      inDoubleQuote = true
      current += char
      continue
    }

    if (char === '[') bracketDepth += 1
    if (char === ']') bracketDepth -= 1
    if (char === '{') braceDepth += 1
    if (char === '}') braceDepth -= 1
    if (char === '(') parenDepth += 1
    if (char === ')') parenDepth -= 1

    if (bracketDepth < 0 || braceDepth < 0 || parenDepth < 0) {
      return null
    }

    if (char === ',' && bracketDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      segments.push(current)
      current = ''
      continue
    }

    current += char
  }

  if (inSingleQuote || inDoubleQuote || bracketDepth !== 0 || braceDepth !== 0 || parenDepth !== 0) {
    return null
  }

  segments.push(current)
  return segments
}

const findTopLevelColonIndex = (value: string): number => {
  let bracketDepth = 0
  let braceDepth = 0
  let parenDepth = 0
  let inSingleQuote = false
  let inDoubleQuote = false
  let isEscaping = false

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index]

    if (isEscaping) {
      isEscaping = false
      continue
    }

    if ((inSingleQuote || inDoubleQuote) && char === '\\') {
      isEscaping = true
      continue
    }

    if (inSingleQuote) {
      if (char === "'") {
        inSingleQuote = false
      }
      continue
    }

    if (inDoubleQuote) {
      if (char === '"') {
        inDoubleQuote = false
      }
      continue
    }

    if (char === "'") {
      inSingleQuote = true
      continue
    }
    if (char === '"') {
      inDoubleQuote = true
      continue
    }

    if (char === '[') bracketDepth += 1
    if (char === ']') bracketDepth -= 1
    if (char === '{') braceDepth += 1
    if (char === '}') braceDepth -= 1
    if (char === '(') parenDepth += 1
    if (char === ')') parenDepth -= 1

    if (char === ':' && bracketDepth === 0 && braceDepth === 0 && parenDepth === 0) {
      return index
    }
  }

  return -1
}

export const checkListDeclaration = (input: string): ListDeclarationCheck => {
  const normalized = input.replace(/\n/g, ' ')
  const trimmed = normalized.trim()

  const hasNoTypeKeyword = !/^(?:list|Array|array|let|var|const|bool)\b/u.test(trimmed)
  const hasNoSemicolon = !/;\s*$/u.test(trimmed)
  const hasSingleAssignment =
    (trimmed.match(/=/g)?.length ?? 0) === 1 &&
    !/(?:==|!=|<=|>=)/u.test(trimmed)

  const assignmentIndex = trimmed.indexOf('=')
  const leftSide = assignmentIndex >= 0 ? trimmed.slice(0, assignmentIndex).trim() : ''
  const rightSide = assignmentIndex >= 0 ? trimmed.slice(assignmentIndex + 1).trim() : ''

  const hasValidName = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(leftSide)
  const hasSquareBrackets = rightSide.startsWith('[') && rightSide.endsWith(']')

  let hasCommaSeparatedItems = false
  if (hasSquareBrackets) {
    const inside = rightSide.slice(1, -1)
    if (inside.trim().length === 0) {
      hasCommaSeparatedItems = true
    } else {
      const parts = splitTopLevelByComma(inside)
      if (parts) {
        const hasTrailingComma = inside.trimEnd().endsWith(',')
        hasCommaSeparatedItems = parts.every((part, index) => {
          const segment = part.trim()
          if (segment.length > 0) {
            return true
          }

          return hasTrailingComma && index === parts.length - 1
        })
      }
    }
  }

  const isValid =
    hasNoTypeKeyword &&
    hasValidName &&
    hasSingleAssignment &&
    hasSquareBrackets &&
    hasCommaSeparatedItems &&
    hasNoSemicolon

  return {
    hasNoTypeKeyword,
    hasValidName,
    hasSingleAssignment,
    hasSquareBrackets,
    hasCommaSeparatedItems,
    hasNoSemicolon,
    isValid
  }
}

const isLikelyHashableKey = (key: string): boolean => {
  const trimmedKey = key.trim()
  if (trimmedKey.length === 0) {
    return false
  }

  if (trimmedKey.startsWith('[') || trimmedKey.startsWith('{')) {
    return false
  }

  if (/^set\s*\(/u.test(trimmedKey)) {
    return false
  }

  return true
}

export const checkDictionaryDeclaration = (input: string): DictionaryDeclarationCheck => {
  const normalized = input.replace(/\n/g, ' ')
  const trimmed = normalized.trim()

  const hasNoTypeKeyword = !/^(?:dict|Dictionary|let|var|const|bool|list)\b/u.test(trimmed)
  const hasNoSemicolon = !/;\s*$/u.test(trimmed)
  const hasSingleAssignment =
    (trimmed.match(/=/g)?.length ?? 0) === 1 &&
    !/(?:==|!=|<=|>=)/u.test(trimmed)

  const assignmentIndex = trimmed.indexOf('=')
  const leftSide = assignmentIndex >= 0 ? trimmed.slice(0, assignmentIndex).trim() : ''
  const rightSide = assignmentIndex >= 0 ? trimmed.slice(assignmentIndex + 1).trim() : ''

  const hasValidName = /^[A-Za-z_][A-Za-z0-9_]*$/u.test(leftSide)
  const hasCurlyBraces = rightSide.startsWith('{') && rightSide.endsWith('}')

  let hasKeyValuePairs = false
  let hasCommaSeparatedPairs = false
  let hasHashableKeys = false

  if (hasCurlyBraces) {
    const inside = rightSide.slice(1, -1)

    if (inside.trim().length === 0) {
      hasKeyValuePairs = true
      hasCommaSeparatedPairs = true
      hasHashableKeys = true
    } else {
      const pairs = splitTopLevelByComma(inside)
      if (pairs) {
        const hasTrailingComma = inside.trimEnd().endsWith(',')
        const normalizedPairs: Array<{ key: string; value: string }> = []
        let pairsValid = true

        for (let index = 0; index < pairs.length; index += 1) {
          const rawPair = pairs[index]
          const segment = rawPair.trim()

          if (segment.length === 0) {
            if (!(hasTrailingComma && index === pairs.length - 1)) {
              pairsValid = false
            }
            continue
          }

          const colonIndex = findTopLevelColonIndex(segment)
          if (colonIndex <= 0) {
            pairsValid = false
            continue
          }

          const key = segment.slice(0, colonIndex).trim()
          const value = segment.slice(colonIndex + 1).trim()
          if (key.length === 0 || value.length === 0) {
            pairsValid = false
            continue
          }

          normalizedPairs.push({ key, value })
        }

        hasKeyValuePairs = pairsValid && normalizedPairs.length > 0
        hasCommaSeparatedPairs = pairsValid
        hasHashableKeys = pairsValid && normalizedPairs.every((pair) => isLikelyHashableKey(pair.key))
      }
    }
  }

  const isValid =
    hasNoTypeKeyword &&
    hasValidName &&
    hasSingleAssignment &&
    hasCurlyBraces &&
    hasKeyValuePairs &&
    hasCommaSeparatedPairs &&
    hasHashableKeys &&
    hasNoSemicolon

  return {
    hasNoTypeKeyword,
    hasValidName,
    hasSingleAssignment,
    hasCurlyBraces,
    hasKeyValuePairs,
    hasCommaSeparatedPairs,
    hasHashableKeys,
    hasNoSemicolon,
    isValid
  }
}

export const isLikelyVariableDeclarationPrefix = (input: string): boolean => {
  const normalized = input.replace(/\n/g, '')
  if (normalized.trim().length === 0) {
    return true
  }

  const prefixPattern =
    /^(?:l|le|let|c|co|con|cons|const|v|va|var)?(?: [$A-Z_a-z][$\w]*)?(?: = [^;]*)?;?$/u

  return prefixPattern.test(normalized)
}

export const pickRandomChallengeIndex = (
  excludedIndices: number[],
  challengeCount: number = CODING_CHALLENGES.length
): number | null => {
  const excluded = new Set(excludedIndices)
  const candidates: number[] = []

  for (let index = 0; index < challengeCount; index += 1) {
    if (!excluded.has(index)) {
      candidates.push(index)
    }
  }

  if (candidates.length === 0) {
    return null
  }

  const randomPosition = Math.floor(Math.random() * candidates.length)
  return candidates[randomPosition]
}

export const CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: 'declare-variable',
    instruction: 'Declare a variable',
    hint: 'Example: score = 0',
    evaluate: (input: string) => {
      const result = checkVariableDeclaration(input)
      return {
        isValid: result.isValid,
        checks: [
          { label: 'variable name', passed: result.hasName },
          { label: 'name uses letters/numbers/underscores only', passed: result.hasValidNameCharacters },
          { label: 'assignment operator (=)', passed: result.hasAssignment },
          { label: 'value after assignment', passed: result.hasValue }
        ]
      }
    }
  },
  {
    id: 'print-statement',
    instruction: 'Write a print statement',
    hint: 'Example: print("hello", name)',
    evaluate: (input: string) => {
      const result = checkPrintStatement(input)
      return {
        isValid: result.isValid,
        checks: [
          { label: 'function statement (print)', passed: result.hasFunctionStatement },
          { label: 'parentheses', passed: result.hasParentheses },
          { label: 'comma-separated arguments (optional)', passed: result.hasCommaSeparatedArguments }
        ]
      }
    }
  },
  {
    id: 'declare-boolean',
    instruction: 'Declare a boolean variable (Python)',
    hint: 'Example: is_valid = True',
    evaluate: (input: string) => {
      const result = checkBooleanDeclaration(input)
      return {
        isValid: result.isValid,
        checks: [
          { label: 'no type keyword', passed: result.hasNoTypeKeyword },
          { label: 'valid variable name (letters/numbers/underscores)', passed: result.hasValidName },
          { label: 'single assignment operator (=)', passed: result.hasSingleAssignment },
          { label: 'boolean literal (True or False)', passed: result.hasBooleanLiteral },
          { label: 'boolean value is unquoted', passed: result.hasUnquotedBooleanValue },
          { label: 'no semicolon', passed: result.hasNoSemicolon }
        ]
      }
    }
  },
  {
    id: 'declare-list',
    instruction: 'Create a list variable (Python)',
    hint: 'Example: numbers = [1, 2, 3]',
    evaluate: (input: string) => {
      const result = checkListDeclaration(input)
      return {
        isValid: result.isValid,
        checks: [
          { label: 'no type keyword', passed: result.hasNoTypeKeyword },
          { label: 'valid variable name (letters/numbers/underscores)', passed: result.hasValidName },
          { label: 'single assignment operator (=)', passed: result.hasSingleAssignment },
          { label: 'square bracket list literal []', passed: result.hasSquareBrackets },
          { label: 'comma-separated items (or empty list)', passed: result.hasCommaSeparatedItems },
          { label: 'no semicolon', passed: result.hasNoSemicolon }
        ]
      }
    }
  },
  {
    id: 'declare-dictionary',
    instruction: 'Create a dictionary variable (Python)',
    hint: 'Example: point = {"x": 10, "y": 20}',
    evaluate: (input: string) => {
      const result = checkDictionaryDeclaration(input)
      return {
        isValid: result.isValid,
        checks: [
          { label: 'no type keyword', passed: result.hasNoTypeKeyword },
          { label: 'valid variable name (letters/numbers/underscores)', passed: result.hasValidName },
          { label: 'single assignment operator (=)', passed: result.hasSingleAssignment },
          { label: 'curly-brace dictionary literal {}', passed: result.hasCurlyBraces },
          { label: 'key:value pairs present', passed: result.hasKeyValuePairs },
          { label: 'pairs separated by commas', passed: result.hasCommaSeparatedPairs },
          { label: 'keys are likely hashable', passed: result.hasHashableKeys },
          { label: 'no semicolon', passed: result.hasNoSemicolon }
        ]
      }
    }
  }
]

const TextBank: React.FC = () => null

export default TextBank
