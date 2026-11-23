import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'dist')
const outputDir = join(projectRoot, 'standalone')
const docsDir = join(projectRoot, 'docs')

const html = await readFile(join(distDir, 'index.html'), 'utf8')
const scriptMatch = html.match(/<script[^>]+src="([^"]+)"[^>]*><\/script>/)
const styleMatch = html.match(/<link[^>]+href="([^"]+\.css)"[^>]*>/)

if (!scriptMatch || !styleMatch) {
  throw new Error('Could not find the generated JavaScript and CSS assets.')
}

const assetPath = value => join(distDir, value.replace(/^\.\//, ''))
const javascript = (await readFile(assetPath(scriptMatch[1]), 'utf8')).replace(/<\/script/gi, '<\\/script')
const stylesheet = (await readFile(assetPath(styleMatch[1]), 'utf8')).replace(/<\/style/gi, '<\\/style')

const standaloneHtml = html
  .replace(styleMatch[0], () => `<style>${stylesheet}</style>`)
  .replace(scriptMatch[0], () => `<script type="module">${javascript}</script>`)

await rm(outputDir, { recursive: true, force: true })
await mkdir(outputDir, { recursive: true })
await writeFile(join(outputDir, 'index.html'), standaloneHtml)
await writeFile(join(outputDir, '.nojekyll'), '')
await cp(join(distDir, 'course-materials'), join(outputDir, 'course-materials'), { recursive: true })
await rm(docsDir, { recursive: true, force: true })
await cp(outputDir, docsDir, { recursive: true })

console.log(`Standalone website created at ${join(outputDir, 'index.html')}`)
console.log(`GitHub Pages copy created at ${join(docsDir, 'index.html')}`)
