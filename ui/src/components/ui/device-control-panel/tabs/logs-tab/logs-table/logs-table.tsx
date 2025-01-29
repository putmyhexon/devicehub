import { useEffect, useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Placeholder } from '@vkontakte/vkui'
import { useInjection } from 'inversify-react'
import { useTranslation } from 'react-i18next'
import { Icon28HourglassOutline, Icon28InboxOutline, Icon28RectrangleHandPointUp } from '@vkontakte/icons'
import { flexRender, getCoreRowModel, getFilteredRowModel, useReactTable } from '@tanstack/react-table'

import { fuzzyFilter } from '@/components/ui/device-table/helpers'
import { ConditionalRender } from '@/components/lib/conditional-render'

import { logsTableState } from '@/store/logs-table-state'
import { CONTAINER_IDS } from '@/config/inversify/container-ids'

import { Filter } from './filter'
import { LOGS_COLUMNS } from './columns'
import { TableRow } from './table-row'

import styles from './logs-table.module.css'

import type { ColumnFiltersState } from '@tanstack/react-table'

export const LogsTable = observer(() => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const endOfLogsRef = useRef<HTMLTableRowElement>(null)
  const { t } = useTranslation()

  const logcatService = useInjection(CONTAINER_IDS.logcatService)

  useEffect(() => {
    if (!endOfLogsRef.current) return undefined

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (endOfLogsRef.current && !entry.isIntersecting) {
          endOfLogsRef.current.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' })
        }
      },
      { threshold: 0.1 }
    )

    intersectionObserver.observe(endOfLogsRef.current)

    return () => {
      intersectionObserver.disconnect()
    }
  }, [])

  const table = useReactTable({
    data: logcatService.visibleDeviceLogs,
    columns: LOGS_COLUMNS,
    state: {
      columnFilters,
      globalFilter: logsTableState.globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: logsTableState.setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    globalFilterFn: 'fuzzy',
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  })

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <colgroup>
          <col className={styles.logcatLevel} />
          <col className={styles.time} />
          <col className={styles.pid} />
          <col className={styles.tid} />
          <col className={styles.tag} />
          <col className={styles.text} />
        </colgroup>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getCanFilter() ? <Filter column={header.column} /> : null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} />
          ))}
          <tr ref={endOfLogsRef} />
        </tbody>
      </table>
      <ConditionalRender
        conditions={[logcatService.visibleDeviceLogs.length === 0 && logcatService.isDeviceLogcatStarted]}
      >
        <Placeholder className={styles.placeholder} icon={<Icon28HourglassOutline />}>
          {t('Waiting for logs')}
        </Placeholder>
      </ConditionalRender>
      <ConditionalRender
        conditions={[logcatService.visibleDeviceLogs.length === 0 && !logcatService.isDeviceLogcatStarted]}
      >
        <Placeholder className={styles.placeholder} icon={<Icon28RectrangleHandPointUp />}>
          {t('Click the start button')}
        </Placeholder>
      </ConditionalRender>
      <ConditionalRender
        conditions={[table.getRowModel().rows.length === 0 && logcatService.visibleDeviceLogs.length > 0]}
      >
        <Placeholder className={styles.placeholder} icon={<Icon28InboxOutline />}>
          {t('Empty')}
        </Placeholder>
      </ConditionalRender>
    </div>
  )
})
