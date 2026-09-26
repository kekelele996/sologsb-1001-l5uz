import type { Cue } from '../types'

/** 配音语速基准：每秒 4 个非空白字符 */
export const BASE_RATE = 4
/** 估算误差容忍：低于该秒数不标记超出 */
export const OVERFLOW_EPSILON = 0.04

export const countReadableChars = (text: string): number => text.replace(/\s+/g, '').length

export const estimateDuration = (cue: Pick<Cue, 'target' | 'speed'>): number => {
  const chars = countReadableChars(cue.target)
  if (!chars) return 0
  const speed = cue.speed > 0 ? cue.speed : 1
  return chars / (BASE_RATE * speed)
}

export interface DubbingFit {
  chars: number
  estimated: number
  window: number
  overflow: number
}

export const dubbingFit = (cue: Pick<Cue, 'target' | 'speed' | 'start' | 'end'>): DubbingFit => {
  const chars = countReadableChars(cue.target)
  const estimated = estimateDuration(cue)
  const window = Math.max(0, cue.end - cue.start)
  return { chars, estimated, window, overflow: chars ? Math.max(0, estimated - window) : 0 }
}

export const isOverflow = (fit: DubbingFit): boolean => fit.overflow > OVERFLOW_EPSILON
