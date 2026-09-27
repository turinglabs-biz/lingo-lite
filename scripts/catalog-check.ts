// Validates the Catalog and prints the Batch layout. Exits non-zero on problems.
import { topics } from '../catalog/catalog.ts'
import { catalog } from '../src/catalog/index.ts'
import { BATCH_SIZE } from '../src/catalog/order.ts'
import { validateCatalog } from '../src/catalog/validate.ts'

const problems = validateCatalog(topics, catalog)
for (let i = 0; i < catalog.length; i += BATCH_SIZE) {
  const batch = catalog.slice(i, i + BATCH_SIZE)
  console.log(`Batch ${i / BATCH_SIZE + 1}: ${batch.map((e) => e.id).join(', ')}`)
}
console.log(`\n${catalog.length} Expressions in ${topics.length} Topics, ${Math.ceil(catalog.length / BATCH_SIZE)} Batches.`)
if (problems.length) {
  console.error(`\n${problems.length} problem(s):\n${problems.join('\n')}`)
  process.exit(1)
}
