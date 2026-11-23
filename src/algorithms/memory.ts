export type AllocationStrategy = 'FIRST_FIT' | 'BEST_FIT' | 'WORST_FIT'
export interface Allocation { process: string; size: number; holeIndex: number | null; remainingAfter: number | null; explanation: string }
export interface AllocationResult { allocations: Allocation[]; holes: number[]; unallocated: number; externalFragmentation: number }

export function allocateMemory(holeSizes: number[], processSizes: number[], strategy: AllocationStrategy): AllocationResult {
  if (!holeSizes.length || holeSizes.some(n => !Number.isFinite(n) || n <= 0)) throw new Error('Every memory hole must be positive.')
  if (!processSizes.length || processSizes.some(n => !Number.isFinite(n) || n <= 0)) throw new Error('Every process size must be positive.')
  const holes = [...holeSizes]
  const allocations = processSizes.map((size, i) => {
    const candidates = holes.map((space, index) => ({ space, index })).filter(h => h.space >= size)
    let chosen = candidates[0]
    if (strategy === 'BEST_FIT') chosen = [...candidates].sort((a, b) => a.space - b.space || a.index - b.index)[0]
    if (strategy === 'WORST_FIT') chosen = [...candidates].sort((a, b) => b.space - a.space || a.index - b.index)[0]
    if (!chosen) return { process: `P${i + 1}`, size, holeIndex: null, remainingAfter: null, explanation: `P${i + 1} (${size}) cannot fit in any current hole and remains waiting.` }
    holes[chosen.index] -= size
    return { process: `P${i + 1}`, size, holeIndex: chosen.index, remainingAfter: holes[chosen.index], explanation: `${strategy.replace('_', ' ')} selects hole ${chosen.index + 1} (${chosen.space}); ${chosen.space} − ${size} = ${holes[chosen.index]} remains.` }
  })
  return { allocations, holes, unallocated: allocations.filter(a => a.holeIndex === null).length, externalFragmentation: holes.reduce((a, b) => a + b, 0) }
}

export function fixedPartitionAllocate(partitions: number[], processes: number[], strategy: Exclude<AllocationStrategy, 'WORST_FIT'>) {
  if (partitions.some(n => n <= 0) || processes.some(n => n <= 0)) throw new Error('Sizes must be positive.')
  const free = partitions.map(() => true)
  return processes.map((size, pIndex) => {
    const fits = partitions.map((size, index) => ({ size, index })).filter(x => free[x.index] && x.size >= size)
    const chosen = strategy === 'FIRST_FIT' ? fits[0] : [...fits].sort((a, b) => a.size - b.size || a.index - b.index)[0]
    if (!chosen) return { process: `P${pIndex + 1}`, partition: null, internalFragmentation: null }
    free[chosen.index] = false
    return { process: `P${pIndex + 1}`, partition: chosen.index, internalFragmentation: chosen.size - size }
  })
}
