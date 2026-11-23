export type ReplacementAlgorithm = 'FIFO' | 'LRU' | 'OPTIMAL'
export interface ReplacementStep { reference: number; frames: (number | null)[]; hit: boolean; victim: number | null; explanation: string }
export interface ReplacementResult { steps: ReplacementStep[]; faults: number; hits: number; faultRatio: number; hitRatio: number }

export function replacePages(references: number[], frameCount: number, algorithm: ReplacementAlgorithm): ReplacementResult {
  if (!Number.isInteger(frameCount) || frameCount <= 0) throw new Error('Frame count must be a positive integer.')
  if (!references.length || references.some(n => !Number.isInteger(n) || n < 0)) throw new Error('References must be non-negative integers.')
  const frames: (number | null)[] = Array(frameCount).fill(null)
  const loadedAt = new Map<number, number>()
  const usedAt = new Map<number, number>()
  const steps: ReplacementStep[] = []
  let faults = 0

  references.forEach((page, index) => {
    const hitIndex = frames.indexOf(page)
    if (hitIndex >= 0) {
      usedAt.set(page, index)
      steps.push({ reference: page, frames: [...frames], hit: true, victim: null, explanation: `${page} is already in frame ${hitIndex}; this is a hit.${algorithm === 'FIFO' ? ' FIFO insertion order does not change on a hit.' : algorithm === 'LRU' ? ' Its recency is updated.' : ''}` })
      return
    }
    faults++
    let target = frames.indexOf(null)
    let victim: number | null = null
    if (target < 0) {
      if (algorithm === 'FIFO') target = indexOfMin(frames, p => loadedAt.get(p!) ?? -1)
      if (algorithm === 'LRU') target = indexOfMin(frames, p => usedAt.get(p!) ?? -1)
      if (algorithm === 'OPTIMAL') {
        const distances = frames.map(p => {
          const next = references.slice(index + 1).indexOf(p!)
          return next < 0 ? Number.POSITIVE_INFINITY : next
        })
        target = distances.indexOf(Math.max(...distances))
      }
      victim = frames[target]
    }
    frames[target] = page
    loadedAt.set(page, index)
    usedAt.set(page, index)
    const why = victim === null ? `An empty frame is available at index ${target}.` : algorithm === 'FIFO' ? `${victim} entered earliest, so FIFO removes it.` : algorithm === 'LRU' ? `${victim} was used least recently.` : `${victim} is needed farthest in the future (or never again).`
    steps.push({ reference: page, frames: [...frames], hit: false, victim, explanation: `${page} is absent, so this is a fault. ${why}` })
  })
  const hits = references.length - faults
  return { steps, faults, hits, faultRatio: faults / references.length, hitRatio: hits / references.length }
}

function indexOfMin(items: (number | null)[], value: (item: number | null) => number) {
  const values = items.map(value)
  return values.indexOf(Math.min(...values))
}
