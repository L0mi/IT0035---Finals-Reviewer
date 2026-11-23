import type { ModuleId } from '../types'

export interface CourseMaterial {
  module: ModuleId
  title: string
  description: string
  pages: number
  file: string
}

export const courseMaterials: CourseMaterial[] = [
  { module: 1, title: 'Introduction to Operating Systems', description: 'OS goals, services, interfaces, kernels, interrupts, architectures, and computing environments.', pages: 45, file: 'module-1-introduction-to-operating-systems.pdf' },
  { module: 2, title: 'Process Management', description: 'Processes, states, PCB, concurrency, scheduling criteria, and CPU scheduling algorithms.', pages: 55, file: 'module-2-process-management.pdf' },
  { module: 3, title: 'Memory Management', description: 'Address binding, allocation, fragmentation, paging, page tables, and segmentation.', pages: 63, file: 'module-3-memory-management.pdf' },
  { module: 4, title: 'Virtual Memory', description: 'Demand paging, page faults, and FIFO, Optimal, and LRU page replacement.', pages: 34, file: 'module-4-virtual-memory.pdf' },
]

export const courseMaterialUrl = (module: ModuleId) => {
  const material = courseMaterials.find(item => item.module === module)
  return material ? `${import.meta.env.BASE_URL}course-materials/${material.file}` : '#'
}
