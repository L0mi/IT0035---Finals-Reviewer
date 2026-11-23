export interface TranslationResult { page: number; offset: number; frame: number; physicalAddress: number; substitution: string }

export function translateAddress(logicalAddress: number, pageSize: number, pageTable: (number | null)[], logicalSpaceSize?: number): TranslationResult {
  if (!Number.isInteger(pageSize) || pageSize <= 0) throw new Error('Page size must be a positive integer.')
  if (!Number.isInteger(logicalAddress) || logicalAddress < 0) throw new Error('Logical address must be a non-negative integer.')
  if (logicalSpaceSize !== undefined && logicalAddress >= logicalSpaceSize) throw new Error('Logical address is outside the process address space.')
  const page = Math.floor(logicalAddress / pageSize)
  const offset = logicalAddress % pageSize
  if (page >= pageTable.length) throw new Error(`Page ${page} is outside the page table.`)
  const frame = pageTable[page]
  if (frame === null || frame === undefined || !Number.isInteger(frame) || frame < 0) throw new Error(`Page ${page} is invalid or not resident.`)
  const physicalAddress = frame * pageSize + offset
  return { page, offset, frame, physicalAddress, substitution: `page = floor(${logicalAddress}/${pageSize}) = ${page}; offset = ${logicalAddress} mod ${pageSize} = ${offset}; physical = ${frame} × ${pageSize} + ${offset} = ${physicalAddress}` }
}
