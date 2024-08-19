import { method } from '@vtex/api'

import { IMPORT_ENTITY_FIELDS, IMPORT_EXECUTION_FIELDS } from '../helpers'

const PAG = { page: 1, pageSize: 500 }
const SORT = 'createdIn desc'

const outputHTML = (data?: unknown[]) =>
  data?.length ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''

const status = async (context: Context) => {
  const {
    privateClient,
    importExecution,
    importEntity,
    targetCatalog,
  } = context.clients

  const user = await privateClient.getUser().catch(() => {
    context.status = 401
    context.body = 'Not allowed'
  })

  if (!user) return

  const targetBrands = (await targetCatalog.getBrands()).filter(
    (b) => b.isActive
  )

  const targetCategories = await targetCatalog.getCategoryTreeFlattened()

  const {
    data: imports,
    pagination: { total: totalImports },
  } = await importExecution.searchRaw(PAG, IMPORT_EXECUTION_FIELDS, SORT)

  const {
    data: entities,
    pagination: { total: totalEntities },
  } = await importEntity.searchRaw(PAG, IMPORT_ENTITY_FIELDS, SORT)

  context.status = 200
  context.set('Content-Type', 'text/html')
  context.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  context.set('Pragma', 'no-cache')
  context.body = `<html>
  <head>
    <title>VTEX Catalog Importer Status</title>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8" />
    <style>
      body {
        padding: 10px;
        margin: 0;
        font-family: system-ui;
      }
      .flex {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .flex section {
        flex: 1;
        max-width: 50%;
        min-width: 45%;
        overflow: auto;
        padding: 5px;
        border: 1px solid #ccc;
      }
    </style>
  </head>
  <body>
    <h1>VTEX Catalog Importer Status</h1>
    <h2>Logged as ${user}</h2>
    <div class="flex">
      <section>
        <h3>Target active brands - total: ${targetBrands.length}</h3>
        ${outputHTML(targetBrands)}
      </section>
      <section>
        <h3>Target active categories - total: ${targetCategories.length}</h3>
        ${outputHTML(targetCategories)}
      </section>
      <section>
        <h3>Imports - total: ${totalImports}</h3>
        ${outputHTML(imports)}
      </section>
      <section>
        <h3>Entities - total: ${totalEntities}</h3>
        ${outputHTML(entities)}
      </section>
    </div>
  </body>
</html>`
}

export default method({ GET: status })
