import { observer } from 'mobx-react-lite'
import { useInjection } from 'inversify-react'
import { Placeholder } from '@vkontakte/vkui'
import { useTranslation } from 'react-i18next'
import { Icon28InboxOutline } from '@vkontakte/icons'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

import { ConditionalRender } from '@/components/lib/conditional-render'

import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { TableRow } from './table-row'
import { FILE_EXPLORER_COLUMNS } from './columns'

import styles from './file-explorer-table.module.css'

export const FileExplorerTable = observer(() => {
  const { t } = useTranslation()

  const fileExplorerService = useInjection(CONTAINER_IDS.fileExplorerService)

  const table = useReactTable({
    data: fileExplorerService.sortedFsList,
    columns: FILE_EXPLORER_COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.name} />
          <col className={styles.size} />
          <col className={styles.date} />
          <col className={styles.permissions} />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
      <ConditionalRender conditions={[fileExplorerService.isFsListEmpty]}>
        <Placeholder className={styles.placeholder} icon={<Icon28InboxOutline />}>
          {t('Empty')}
        </Placeholder>
      </ConditionalRender>
    </div>
  )
})
