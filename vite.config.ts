import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative assets work on both a user site and a /repository-name/ Pages URL.
  base: './',
  plugins: [react()],
  test: { environment: 'node' },
})
