import { AdminGetWorkflowExecutionsParams } from "@medusajs/medusa"
import { Container, Heading } from "@medusajs/ui"
import { useAdminCustomQuery } from "medusa-react"
import { useTranslation } from "react-i18next"
import { DataTable } from "../../../../../components/table/data-table"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { WorkflowExecutionDTO } from "../../../types"
import { adminExecutionKey } from "../../../utils"
import { useExecutionTableColumns } from "./use-execution-table-columns"
import { useExecutionTableQuery } from "./use-execution-table-query"

/**
 * Type isn't exported from the package
 */
type WorkflowExecutionsRes = {
  workflow_executions: WorkflowExecutionDTO[]
  count: number
  offset: number
  limit: number
}

const PAGE_SIZE = 20

export const ExecutionsListTable = () => {
  const { t } = useTranslation()

  const { searchParams, raw } = useExecutionTableQuery({
    pageSize: PAGE_SIZE,
  })
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminGetWorkflowExecutionsParams,
    WorkflowExecutionsRes
  >(
    "/workflows-executions",
    adminExecutionKey.list(searchParams),
    {
      ...searchParams,
      fields: "execution,state",
    },
    {
      keepPreviousData: true,
    }
  )

  const columns = useExecutionTableColumns()

  const { table } = useDataTable({
    data: data?.workflow_executions || [],
    columns,
    count: data?.count,
    pageSize: PAGE_SIZE,
    enablePagination: true,
    getRowId: (row) => row.id,
  })

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading>{t("executions.domain")}</Heading>
      </div>
      <DataTable
        table={table}
        columns={columns}
        count={data?.count}
        isLoading={isLoading}
        pageSize={PAGE_SIZE}
        navigateTo={(row) => `${row.id}`}
        search
        pagination
        queryObject={raw}
      />
    </Container>
  )
}
