import { PencilSquare, Trash } from "@medusajs/icons"
import { Customer, CustomerGroup } from "@medusajs/medusa"
import { Button, Checkbox, Container, Heading, usePrompt } from "@medusajs/ui"
import { createColumnHelper } from "@tanstack/react-table"
import {
  useAdminCustomerGroupCustomers,
  useAdminRemoveCustomersFromCustomerGroup,
} from "medusa-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { DataTable } from "../../../../../components/table/data-table"
import { useCustomerTableColumns } from "../../../../../hooks/table/columns/use-customer-table-columns"
import { useCustomerTableFilters } from "../../../../../hooks/table/filters/use-customer-table-filters"
import { useCustomerTableQuery } from "../../../../../hooks/table/query/use-customer-table-query"
import { useDataTable } from "../../../../../hooks/use-data-table"

type CustomerGroupCustomerSectionProps = {
  group: CustomerGroup
}

const PAGE_SIZE = 10

export const CustomerGroupCustomerSection = ({
  group,
}: CustomerGroupCustomerSectionProps) => {
  const { t } = useTranslation()

  const { searchParams, raw } = useCustomerTableQuery({ pageSize: PAGE_SIZE })
  const { customers, count, isLoading, isError, error } =
    useAdminCustomerGroupCustomers(
      group.id,
      {
        ...searchParams,
      },
      {
        keepPreviousData: true,
      }
    )

  const filters = useCustomerTableFilters(["groups"])
  const columns = useColumns()

  const { table } = useDataTable({
    data: customers ?? [],
    columns,
    count,
    getRowId: (row) => row.id,
    enablePagination: true,
    enableRowSelection: true,
    pageSize: PAGE_SIZE,
    meta: {
      customerGroupId: group.id,
    },
  })

  const { mutateAsync } = useAdminRemoveCustomersFromCustomerGroup(group.id)
  const prompt = usePrompt()

  const handleRemoveCustomers = async (selection: Record<string, boolean>) => {
    const selected = Object.keys(selection).filter((k) => selection[k])

    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("customerGroups.removeCustomersWarning", {
        count: selected.length,
      }),
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync({
      customer_ids: selected.map((s) => ({ id: s })),
    })
  }

  if (isError) {
    throw error
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("customers.domain")}</Heading>
        <Link to={`/customer-groups/${group.id}/add-customers`}>
          <Button variant="secondary" size="small">
            {t("general.add")}
          </Button>
        </Link>
      </div>
      <DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        isLoading={isLoading}
        count={count}
        navigateTo={(row) => `/customers/${row.id}`}
        filters={filters}
        search
        pagination
        orderBy={[
          "email",
          "first_name",
          "last_name",
          "has_account",
          "created_at",
          "updated_at",
        ]}
        commands={[
          {
            action: handleRemoveCustomers,
            label: t("actions.remove"),
            shortcut: "r",
          },
        ]}
        queryObject={raw}
      />
    </Container>
  )
}

const CustomerActions = ({
  customer,
  customerGroupId,
}: {
  customer: Customer
  customerGroupId: string
}) => {
  const { t } = useTranslation()
  const { mutateAsync } =
    useAdminRemoveCustomersFromCustomerGroup(customerGroupId)

  const prompt = usePrompt()

  const handleRemove = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("customerGroups.removeCustomersWarning", {
        count: 1,
      }),
      confirmText: t("actions.continue"),
      cancelText: t("actions.cancel"),
    })

    if (!res) {
      return
    }

    await mutateAsync({
      customer_ids: [{ id: customer.id }],
    })
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              icon: <PencilSquare />,
              label: t("actions.edit"),
              to: `/customers/${customer.id}/edit`,
            },
          ],
        },
        {
          actions: [
            {
              icon: <Trash />,
              label: t("actions.remove"),
              onClick: handleRemove,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<Customer>()

const useColumns = () => {
  const columns = useCustomerTableColumns()

  return useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => {
          return (
            <Checkbox
              checked={
                table.getIsSomePageRowsSelected()
                  ? "indeterminate"
                  : table.getIsAllPageRowsSelected()
              }
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />
          )
        },
        cell: ({ row }) => {
          return (
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              onClick={(e) => {
                e.stopPropagation()
              }}
            />
          )
        },
      }),
      ...columns,
      columnHelper.display({
        id: "actions",
        cell: ({ row, table }) => {
          const { customerGroupId } = table.options.meta as {
            customerGroupId: string
          }

          return (
            <CustomerActions
              customer={row.original}
              customerGroupId={customerGroupId}
            />
          )
        },
      }),
    ],
    [columns]
  )
}
