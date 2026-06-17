/**
 * Set a single version across the root app package and every @pictwo/* package.
 * Used by the release workflow.
 *
 * Usage: tsx scripts/pictwo/set-version.ts <version>
 */
import { readFileSync, writeFileSync } from 'node:fs'

import path from 'node:path'

const TARGETS = [
  'package.json',
  'packages/pictwo-core/package.json',
  'packages/pictwo-faker/package.json',
  'packages/pictwo-images/package.json',
]

function main () {
  const version = process.argv[2]?.replace(/^v/, '')
  if (!version || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) {
    throw new Error(`[pictwo] Invalid version "${process.argv[2]}". Expected e.g. 1.2.3 or 1.2.3-beta.1.`)
  }

  for (const target of TARGETS) {
    const file = path.resolve(process.cwd(), target)
    const pkg = JSON.parse(readFileSync(file, 'utf-8'))
    pkg.version = version
    writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
    console.log(`  ${pkg.name}@${version}`)
  }

  console.log(`\nSet version ${version} across ${TARGETS.length} package(s).`)
}

main()
