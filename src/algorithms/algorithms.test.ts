import { describe, expect, it } from 'vitest'
import { schedule } from './scheduling'
import { replacePages } from './pageReplacement'
import { allocateMemory } from './memory'
import { translateAddress } from './paging'
import { questions } from '../data/content'

describe('CPU scheduling', () => {
  const base = [
    { pid:'P1',arrival:0,burst:5,priority:2 },
    { pid:'P2',arrival:1,burst:3,priority:1 },
    { pid:'P3',arrival:2,burst:1,priority:3 },
  ]
  it('computes FCFS completion and metrics', () => {
    const r=schedule(base,'FCFS')
    expect(r.segments.map(s=>s.pid)).toEqual(['P1','P2','P3'])
    expect(r.metrics.map(m=>m.completion)).toEqual([5,8,9])
    expect(r.metrics.map(m=>m.waiting)).toEqual([0,4,6])
  })
  it('computes non-preemptive SJF', () => expect(schedule(base,'SJF').segments.map(s=>s.pid)).toEqual(['P1','P3','P2']))
  it('preempts under SRTF', () => expect(schedule(base,'SRTF').segments.map(s=>s.pid)).toEqual(['P1','P2','P3','P2','P1']))
  it('supports both priority directions', () => {
    expect(schedule(base,'PRIORITY_NP',{smallerPriorityHigher:true}).segments.map(s=>s.pid)).toEqual(['P1','P2','P3'])
    expect(schedule(base,'PRIORITY_NP',{smallerPriorityHigher:false}).segments.map(s=>s.pid)).toEqual(['P1','P3','P2'])
  })
  it('uses quantum and queue order for Round Robin', () => expect(schedule(base,'RR',{quantum:2}).segments.map(s=>s.pid)).toEqual(['P1','P2','P3','P1','P2','P1']))
  it('shows idle gaps and simultaneous arrival ties deterministically', () => {
    const r=schedule([{pid:'P2',arrival:3,burst:1,priority:1},{pid:'P1',arrival:3,burst:1,priority:1}],'FCFS')
    expect(r.segments.map(s=>s.pid)).toEqual([null,'P1','P2'])
    expect(r.segments[0]).toMatchObject({start:0,end:3})
  })
  it('rejects invalid burst and quantum', () => {
    expect(()=>schedule([{pid:'P1',arrival:0,burst:0,priority:1}],'FCFS')).toThrow()
    expect(()=>schedule(base,'RR',{quantum:0})).toThrow()
  })
})

describe('page replacement', () => {
  const full=[7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1]
  it('matches the 20-reference fixture', () => {
    expect(replacePages(full,3,'FIFO').faults).toBe(15)
    expect(replacePages(full,3,'OPTIMAL').faults).toBe(9)
    expect(replacePages(full,3,'LRU').faults).toBe(12)
  })
  it('treats empty loads as faults and repeated resident pages as hits', () => {
    const r=replacePages([1,1,1],3,'FIFO')
    expect(r.faults).toBe(1); expect(r.hits).toBe(2)
  })
  it('FIFO hits do not refresh insertion order', () => {
    const r=replacePages([1,2,3,1,4],3,'FIFO')
    expect(r.steps.at(-1)?.victim).toBe(1)
  })
  it('supports frame-count changes and rejects empty frames', () => {
    expect(replacePages([1,2,3],2,'LRU').steps.at(-1)?.frames).toEqual([3,2])
    expect(()=>replacePages([1],0,'FIFO')).toThrow()
  })
})

describe('memory allocation and paging', () => {
  it('allocates First Fit and Best Fit correctly', () => {
    expect(allocateMemory([100,500,200],[180],'FIRST_FIT').allocations[0].holeIndex).toBe(1)
    expect(allocateMemory([100,500,200],[180],'BEST_FIT').allocations[0].holeIndex).toBe(2)
  })
  it('keeps impossible processes unallocated without NaN', () => {
    const r=allocateMemory([100],[200],'FIRST_FIT')
    expect(r.unallocated).toBe(1); expect(r.holes).toEqual([100])
  })
  it('translates page, offset, and physical address', () => expect(translateAddress(2500,1024,[3,1,5])).toMatchObject({page:2,offset:452,frame:5,physicalAddress:5572}))
  it('rejects invalid, nonresident, and out-of-range addresses', () => {
    expect(()=>translateAddress(-1,1024,[0])).toThrow()
    expect(()=>translateAddress(1500,1024,[0,null])).toThrow(/not resident/)
    expect(()=>translateAddress(2000,1024,[0,1],1500)).toThrow(/outside/)
  })
})

describe('curated question bank', () => {
  it('contains 50 complete, uniquely identified questions', () => {
    expect(questions).toHaveLength(50)
    expect(new Set(questions.map(q=>q.id)).size).toBe(questions.length)
    for (const q of questions) {
      expect(q.module).toBeGreaterThanOrEqual(1)
      expect(q.module).toBeLessThanOrEqual(4)
      expect(q.topic.trim()).not.toBe('')
      expect(q.prompt.trim()).not.toBe('')
      expect(q.hint.trim()).not.toBe('')
      expect(q.explanation.trim()).not.toBe('')
      expect(q.source.trim()).not.toBe('')
      expect(Array.isArray(q.correct) ? q.correct.length : q.correct.trim().length).toBeGreaterThan(0)
      if (q.type !== 'input') expect(q.options?.length).toBeGreaterThanOrEqual(2)
    }
  })
  it('has no duplicate normalized prompts', () => {
    const prompts=questions.map(q=>q.prompt.trim().toLowerCase())
    expect(new Set(prompts).size).toBe(prompts.length)
  })
})
