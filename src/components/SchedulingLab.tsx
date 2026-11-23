import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { schedule, type ProcessInput, type SchedulingAlgorithm } from '../algorithms/scheduling'

const initial: ProcessInput[] = [
  { pid:'P1', arrival:0, burst:7, priority:2 }, { pid:'P2', arrival:2, burst:4, priority:1 }, { pid:'P3', arrival:4, burst:1, priority:3 },
]
const names: Record<SchedulingAlgorithm,string> = { FCFS:'FCFS', SJF:'SJF (non-preemptive)', SRTF:'SRTF / SRT', PRIORITY_NP:'Priority (non-preemptive)', PRIORITY_P:'Priority (preemptive)', RR:'Round Robin' }
const colors = ['bg-violet/80','bg-cyan/70','bg-emerald-400/70','bg-amber-400/70','bg-pink-400/70','bg-blue-400/70']

export default function SchedulingLab({ compact=false }: { compact?: boolean }) {
  const [processes,setProcesses] = useState(initial)
  const [algorithm,setAlgorithm] = useState<SchedulingAlgorithm>('SRTF')
  const [quantum,setQuantum] = useState(3)
  const [smallerHigher,setSmallerHigher] = useState(true)
  const [step,setStep] = useState(0)
  const [playing,setPlaying] = useState(false)
  const [speed,setSpeed] = useState(1)
  const [practice,setPractice] = useState('')
  const [practiceMessage,setPracticeMessage] = useState('')
  const computed = useMemo(() => { try { return { result:schedule(processes,algorithm,{ quantum,smallerPriorityHigher:smallerHigher }), error:'' } } catch(e) { return { result:null,error:e instanceof Error?e.message:'Invalid input' } } },[processes,algorithm,quantum,smallerHigher])
  const result = computed.result
  useEffect(() => { setStep(0); setPlaying(false) },[processes,algorithm,quantum,smallerHigher])
  useEffect(() => {
    if (!playing || !result) return
    const timer = window.setInterval(() => setStep(s => { if (s >= result.ticks.length) { setPlaying(false); return s } return s+1 }), 800/speed)
    return () => clearInterval(timer)
  },[playing,result,speed])
  const update = (index:number,key:keyof ProcessInput,value:string) => setProcesses(ps => ps.map((p,i) => i===index ? { ...p,[key]: key==='pid'?value:Number(value) } : p))
  const current = step > 0 ? result?.ticks[step-1] : undefined

  return <div className="space-y-5">
    <section className="card p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <label><span className="label">Algorithm</span><select className="field" value={algorithm} onChange={e=>setAlgorithm(e.target.value as SchedulingAlgorithm)}>{Object.entries(names).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></label>
        {algorithm==='RR'&&<label><span className="label">Quantum</span><input className="field" type="number" min="1" value={quantum} onChange={e=>setQuantum(Number(e.target.value))}/></label>}
        {algorithm.startsWith('PRIORITY')&&<label><span className="label">Higher priority</span><select className="field" value={smallerHigher?'small':'large'} onChange={e=>setSmallerHigher(e.target.value==='small')}><option value="small">Smaller number</option><option value="large">Larger number</option></select></label>}
        <label><span className="label">Playback speed</span><select className="field" value={speed} onChange={e=>setSpeed(Number(e.target.value))}><option value="0.5">0.5×</option><option value="1">1×</option><option value="2">2×</option><option value="4">4×</option></select></label>
      </div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase text-slate-500"><tr><th className="p-2">PID</th><th className="p-2">Arrival</th><th className="p-2">Burst</th><th className="p-2">Priority</th><th><span className="sr-only">Remove</span></th></tr></thead><tbody>{processes.map((p,i)=><tr key={i} className="border-t border-line"><td className="p-1"><input aria-label={`Process ${i+1} PID`} className="field" value={p.pid} onChange={e=>update(i,'pid',e.target.value)}/></td><td className="p-1"><input aria-label={`${p.pid} arrival`} className="field" type="number" min="0" value={p.arrival} onChange={e=>update(i,'arrival',e.target.value)}/></td><td className="p-1"><input aria-label={`${p.pid} burst`} className="field" type="number" min="1" value={p.burst} onChange={e=>update(i,'burst',e.target.value)}/></td><td className="p-1"><input aria-label={`${p.pid} priority`} className="field" type="number" value={p.priority} onChange={e=>update(i,'priority',e.target.value)}/></td><td className="p-1"><button className="btn px-3" aria-label={`Remove ${p.pid}`} disabled={processes.length===1} onClick={()=>setProcesses(ps=>ps.filter((_,x)=>x!==i))}><Trash2 className="h-4 w-4"/></button></td></tr>)}</tbody></table></div>
      <button className="btn mt-3" onClick={()=>setProcesses(ps=>[...ps,{pid:`P${ps.length+1}`,arrival:0,burst:1,priority:ps.length+1}])}><Plus className="h-4 w-4"/> Add process</button>
    </section>
    {computed.error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{computed.error}</div>}
    {result && <>
      <section className="card p-4">
        <div className="flex flex-wrap items-center gap-2"><button className="btn" onClick={()=>setPlaying(v=>!v)}>{playing?<Pause className="h-4 w-4"/>:<Play className="h-4 w-4"/>}{playing?'Pause':'Play'}</button><button className="btn" onClick={()=>setStep(s=>Math.max(0,s-1))}><ChevronLeft className="h-4 w-4"/>Previous</button><button className="btn" onClick={()=>setStep(s=>Math.min(result.ticks.length,s+1))}>Next<ChevronRight className="h-4 w-4"/></button><button className="btn" onClick={()=>{setStep(0);setPlaying(false)}}><RotateCcw className="h-4 w-4"/>Reset</button><span className="ml-auto chip">Clock: {current?.end ?? 0}</span></div>
        <div className="mt-5 overflow-x-auto pb-3"><div className="flex min-w-[640px]">{result.segments.map((s,i)=>{const duration=s.end-s.start;const pidIndex=Math.max(0,processes.findIndex(p=>p.pid===s.pid));return <div key={i} title={s.reason} className={`relative flex h-16 items-center justify-center border-y border-r border-line text-sm font-black text-slate-950 ${s.pid?colors[pidIndex%colors.length]:'bg-slate-700 text-slate-300'} ${step && current && s.start<=current.start&&s.end>current.start?'ring-2 ring-white ring-inset':''}`} style={{width:`${duration/result.ticks.length*100}%`,minWidth:42}}><span>{s.pid??'IDLE'}</span><span className="absolute -bottom-6 left-0 text-[10px] font-normal text-slate-500">{s.start}</span>{i===result.segments.length-1&&<span className="absolute -bottom-6 right-0 text-[10px] font-normal text-slate-500">{s.end}</span>}</div>})}</div></div>
        <div className="mt-8 grid gap-3 md:grid-cols-3"><div className="rounded-xl bg-ink p-3"><p className="label">Current process</p><p className="text-lg font-bold">{current?.pid??'None / idle'}</p></div><div className="rounded-xl bg-ink p-3"><p className="label">Ready queue</p><p className="text-lg font-bold">{current?.ready.join(' → ')||'Empty'}</p></div><div className="rounded-xl bg-ink p-3"><p className="label">Remaining after tick</p><p className="text-sm font-bold">{current?Object.entries(current.remaining).map(([p,r])=>`${p}:${r}`).join(' · '):'Advance to inspect'}</p></div></div>
        <div aria-live="polite" className="mt-3 rounded-xl border border-cyan/20 bg-cyan/5 p-3 text-sm text-cyan-100"><strong>Why:</strong> {current?.reason??'Use Next or Play to walk through each CPU decision.'}</div>
      </section>
      <section className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="bg-slate-900 text-xs uppercase text-slate-500"><tr>{['PID','CT','TAT substitution','WT substitution','RT'].map(x=><th className="p-3 text-left" key={x}>{x}</th>)}</tr></thead><tbody>{result.metrics.map(m=><tr className="border-t border-line" key={m.pid}><td className="p-3 font-bold">{m.pid}</td><td className="p-3">{m.completion}</td><td className="p-3">{m.completion} − {m.arrival} = <b>{m.turnaround}</b></td><td className="p-3">{m.turnaround} − {m.burst} = <b>{m.waiting}</b></td><td className="p-3">{m.response}</td></tr>)}</tbody><tfoot><tr className="border-t border-line bg-violet/5"><td className="p-3 font-bold" colSpan={2}>Averages</td><td className="p-3 font-bold">TAT {result.averageTurnaround.toFixed(2)}</td><td className="p-3 font-bold">WT {result.averageWaiting.toFixed(2)}</td><td className="p-3 font-bold">RT {result.averageResponse.toFixed(2)}</td></tr></tfoot></table></div></section>
      {!compact&&<><Compare processes={processes} quantum={quantum} smallerHigher={smallerHigher}/><section className="card p-4"><h3 className="font-bold">Editable practice: predict the Gantt sequence</h3><p className="mt-1 text-sm text-slate-400">Enter only process labels in segment order, separated by commas. Consecutive ticks are merged.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input className="field" placeholder="Example: P1, P2, P1" value={practice} onChange={e=>setPractice(e.target.value)}/><button className="btn btn-primary" onClick={()=>{const expected=result.segments.map(s=>s.pid??'IDLE').join(',').toLowerCase();const got=practice.split(',').map(x=>x.trim()).filter(Boolean).join(',').toLowerCase();setPracticeMessage(got===expected?'Correct — your segment order matches.':`Not yet. Recheck arrivals and decision boundaries. Expected ${result.segments.length} segments.`)}}>Check work</button></div>{practiceMessage&&<p className="mt-3 text-sm text-cyan">{practiceMessage}</p>}</section></>}
    </>}
  </div>
}

function Compare({ processes,quantum,smallerHigher }:{processes:ProcessInput[];quantum:number;smallerHigher:boolean}) {
  const algs:SchedulingAlgorithm[]=['FCFS','SJF','SRTF','PRIORITY_NP','PRIORITY_P','RR']
  const rows=algs.flatMap(a=>{try{const r=schedule(processes,a,{quantum,smallerPriorityHigher:smallerHigher});return [{a,r}]}catch{return[]}})
  return <section className="card p-4"><h3 className="font-bold">Compare algorithms</h3><p className="mt-1 text-sm text-slate-400">Same process set; documented ties use arrival time then PID. Preemptive ties keep the running process.</p><div className="mt-4 grid gap-3 lg:grid-cols-2">{rows.map(({a,r})=><div className="rounded-xl border border-line bg-ink p-3" key={a}><div className="flex justify-between"><b>{names[a]}</b><span className="text-xs text-slate-400">Avg WT {r.averageWaiting.toFixed(2)} · TAT {r.averageTurnaround.toFixed(2)}</span></div><div className="mt-2 flex overflow-hidden rounded-lg">{r.segments.map((s,i)=><div key={i} className={`${s.pid?'bg-violet/70 text-slate-950':'bg-slate-700'} flex min-w-8 items-center justify-center border-r border-ink px-1 py-2 text-[10px] font-bold`} style={{width:`${(s.end-s.start)/r.ticks.length*100}%`}}>{s.pid??'I'}</div>)}</div></div>)}</div></section>
}
