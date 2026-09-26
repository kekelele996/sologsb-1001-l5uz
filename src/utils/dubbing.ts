import type { Cue } from '../types'

/** 基准配音语速：每秒 4 个非空白字符 */
export const CHARS_PER_SECOND = 4
/** 顺排时与上一条台词之间的间隔（秒） */
export const ARRANGE_GAP = 0.2
/** 剩余余量低于该比例时标记为偏紧（仍能念完） */
export const TIGHT_RATIO = 0.08

export type TimingRisk = 'fit' | 'tight' | 'overflow'

export interface TimingEstimate {
  /** 参与估算的文本（优先译文，回退原文） */
  text: string
  /** 非空白字符数 */
  characters: number
  /** 角色语速倍率 */
  speed: number
  /** 原时间码时长（秒） */
  slot: number
  /** 估算配音时长（秒）= 字数 / (4 × 语速) */
  estimated: number
  /** 估算超出时间码的秒数，未超出为 0 */
  overflow: number
  /** 剩余余量（秒），为负表示超出 */
  slack: number
  risk: TimingRisk
}

/** 统计非空白字符（含中文、拉丁字母、数字、标点；排除所有 Unicode 空白） */
export const countNonWhitespace = (text: string): number => text.replace(/\s/g, '').length

/** 估算一条台词的配音时长与风险等级 */
export function estimateCue(cue: Pick<Cue, 'source' | 'target' | 'speed' | 'start' | 'end'>): TimingEstimate {
  const text = cue.target?.trim() ? cue.target : cue.source
  const characters = countNonWhitespace(text)
  const speed = cue.speed > 0 ? cue.speed : 1
  const slot = Math.max(0, cue.end - cue.start)
  const estimated = characters / (CHARS_PER_SECOND * speed)
  const slack = slot - estimated
  const overflow = Math.max(0, -slack)
  const risk: TimingRisk = overflow > 0
    ? 'overflow'
    : slot > 0 && slack <= slot * TIGHT_RATIO
      ? 'tight'
      : 'fit'
  return { text, characters, speed, slot, estimated, overflow, slack, risk }
}

export const formatSeconds = (seconds: number): string => {
  if (!Number.isFinite(seconds)) return '—'
  return `${seconds.toFixed(1)}s`
}
