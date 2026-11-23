export type SchedulingAlgorithm = 'FCFS' | 'SJF' | 'SRTF' | 'PRIORITY_NP' | 'PRIORITY_P' | 'RR'
export interface ProcessInput { pid: string; arrival: number; burst: number; priority: number }
export interface Tick { start: number; end: number; pid: string | null; reason: string; ready: string[]; remaining: Record<string, number> }
export interface Segment { start: number; end: number; pid: string | null; reason: string }
export interface ProcessMetric { pid: string; arrival: number; burst: number; completion: number; turnaround: number; waiting: number; response: number }
export interface ScheduleResult { ticks: Tick[]; segments: Segment[]; metrics: ProcessMetric[]; averageTurnaround: number; averageWaiting: number; averageResponse: number }
export interface ScheduleOptions { quantum?: number; smallerPriorityHigher?: boolean }

const byArrivalPid = (a: ProcessInput, b: ProcessInput) => a.arrival - b.arrival || a.pid.localeCompare(b.pid, undefined, { numeric: true })

function validate(processes: ProcessInput[], algorithm: SchedulingAlgorithm, options: ScheduleOptions) {
  if (!processes.length) throw new Error('Add at least one process.')
  const ids = new Set<string>()
  for (const p of processes) {
    if (!p.pid.trim() || ids.has(p.pid)) throw new Error('Every PID must be unique and non-empty.')
    ids.add(p.pid)
    if (!Number.isInteger(p.arrival) || p.arrival < 0) throw new Error('Arrival times must be non-negative integers.')
    if (!Number.isInteger(p.burst) || p.burst <= 0) throw new Error('Burst times must be positive integers.')
    if (!Number.isFinite(p.priority)) throw new Error('Priorities must be numbers.')
  }
  if (algorithm === 'RR' && (!Number.isInteger(options.quantum) || (options.quantum ?? 0) <= 0)) throw new Error('Round Robin quantum must be a positive integer.')
}

export function schedule(processes: ProcessInput[], algorithm: SchedulingAlgorithm, options: ScheduleOptions = {}): ScheduleResult {
  validate(processes, algorithm, options)
  const input = [...processes].sort(byArrivalPid)
  const remaining = Object.fromEntries(input.map(p => [p.pid, p.burst])) as Record<string, number>
  const completion: Record<string, number> = {}
  const firstRun: Record<string, number> = {}
  const ticks: Tick[] = []
  let time = Math.min(...input.map(p => p.arrival), 0)
  let running: ProcessInput | undefined
  let slice = 0
  let rrQueue: ProcessInput[] = []
  let expired: ProcessInput | undefined
  const arrived = new Set<string>()
  const maxTime = input.reduce((s, p) => s + p.burst, 0) + Math.max(...input.map(p => p.arrival)) + 1

  while (Object.keys(completion).length < input.length && time <= maxTime) {
    const newly = input.filter(p => p.arrival === time && remaining[p.pid] > 0)
    newly.forEach(p => arrived.add(p.pid))
    if (algorithm === 'RR') {
      rrQueue.push(...newly)
      if (expired) { rrQueue.push(expired); expired = undefined }
      if (!running) { running = rrQueue.shift(); slice = 0 }
    } else {
      const ready = input.filter(p => p.arrival <= time && remaining[p.pid] > 0)
      const nonPreemptive = algorithm === 'FCFS' || algorithm === 'SJF' || algorithm === 'PRIORITY_NP'
      if (!running || !nonPreemptive) running = choose(ready, algorithm, options.smallerPriorityHigher !== false, remaining, running)
    }

    const readyNow = algorithm === 'RR'
      ? rrQueue.map(p => p.pid)
      : input.filter(p => p.arrival <= time && remaining[p.pid] > 0 && p.pid !== running?.pid).map(p => p.pid)
    if (!running) {
      ticks.push({ start: time, end: time + 1, pid: null, ready: [], remaining: { ...remaining }, reason: 'No process has arrived, so the CPU is idle.' })
      time++
      continue
    }

    if (firstRun[running.pid] === undefined) firstRun[running.pid] = time
    const reason = selectionReason(running, algorithm, readyNow, remaining, options)
    remaining[running.pid]--
    slice++
    ticks.push({ start: time, end: time + 1, pid: running.pid, ready: readyNow, remaining: { ...remaining }, reason })
    time++

    if (remaining[running.pid] === 0) {
      completion[running.pid] = time
      running = undefined
      slice = 0
    } else if (algorithm === 'RR' && slice >= (options.quantum ?? 1)) {
      expired = running
      running = undefined
      slice = 0
    } else if (algorithm === 'SRTF' || algorithm === 'PRIORITY_P') {
      running = undefined
    }
  }

  if (Object.keys(completion).length !== input.length) throw new Error('The schedule could not be completed.')
  const segments = ticks.reduce<Segment[]>((out, tick) => {
    const last = out[out.length - 1]
    if (last && last.pid === tick.pid) last.end = tick.end
    else out.push({ start: tick.start, end: tick.end, pid: tick.pid, reason: tick.reason })
    return out
  }, [])
  const metrics = input.map(p => ({
    pid: p.pid,
    arrival: p.arrival,
    burst: p.burst,
    completion: completion[p.pid],
    turnaround: completion[p.pid] - p.arrival,
    waiting: completion[p.pid] - p.arrival - p.burst,
    response: firstRun[p.pid] - p.arrival,
  }))
  const avg = (key: keyof ProcessMetric) => metrics.reduce((sum, item) => sum + Number(item[key]), 0) / metrics.length
  return { ticks, segments, metrics, averageTurnaround: avg('turnaround'), averageWaiting: avg('waiting'), averageResponse: avg('response') }
}

function choose(ready: ProcessInput[], algorithm: SchedulingAlgorithm, smallerHigher: boolean, remaining: Record<string, number>, current?: ProcessInput) {
  if (!ready.length) return undefined
  const rank = [...ready]
  if (algorithm === 'FCFS') rank.sort(byArrivalPid)
  if (algorithm === 'SJF') rank.sort((a, b) => a.burst - b.burst || byArrivalPid(a, b))
  if (algorithm === 'SRTF') rank.sort((a, b) => remaining[a.pid] - remaining[b.pid] || a.arrival - b.arrival || a.pid.localeCompare(b.pid, undefined, { numeric: true }))
  if (algorithm.startsWith('PRIORITY')) rank.sort((a, b) => (smallerHigher ? a.priority - b.priority : b.priority - a.priority) || a.arrival - b.arrival || a.pid.localeCompare(b.pid, undefined, { numeric: true }))
  if ((algorithm === 'SRTF' || algorithm === 'PRIORITY_P') && current) {
    const candidate = rank[0]
    const tie = algorithm === 'SRTF' ? remaining[candidate.pid] === remaining[current.pid] : candidate.priority === current.priority
    if (tie && remaining[current.pid] > 0) return current
  }
  return rank[0]
}

function selectionReason(p: ProcessInput, algorithm: SchedulingAlgorithm, ready: string[], remaining: Record<string, number>, options: ScheduleOptions) {
  const waiting = ready.length ? ` Ready queue: ${ready.join(', ')}.` : ' The ready queue is otherwise empty.'
  if (algorithm === 'FCFS') return `${p.pid} arrived earliest; FCFS keeps arrival order.${waiting}`
  if (algorithm === 'SJF') return `${p.pid} has the shortest original burst among ready processes.${waiting}`
  if (algorithm === 'SRTF') return `${p.pid} has the shortest remaining time (${remaining[p.pid] + 1} before this tick).${waiting}`
  if (algorithm.startsWith('PRIORITY')) return `${p.pid} has the ${options.smallerPriorityHigher === false ? 'largest' : 'smallest'} priority value among ready processes.${waiting}`
  return `${p.pid} receives the CPU in FIFO ready-queue order for at most ${options.quantum ?? 1} time unit(s).${waiting}`
}
