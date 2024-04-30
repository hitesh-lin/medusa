import { PlusMini, Trash } from "@medusajs/icons"
import { Region } from "@medusajs/medusa"
import { Checkbox, Container, Heading, usePrompt } from "@medusajs/ui"
import {
  ColumnDef,
  RowSelectionState,
  createColumnHelper,
} from "@tanstack/react-table"
import { useAdminUpdateRegion } from "medusa-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { ActionMenu } from "../../../../../components/common/action-menu"
import { DataTable } from "../../../../../components/table/data-table"
import { useDataTable } from "../../../../../hooks/use-data-table"
import { useCountries } from "../../../shared/hooks/use-countries"
import { useCountryTableColumns } from "../../../shared/hooks/use-country-table-columns"
import { useCountryTableQuery } from "../../../shared/hooks/use-country-table-query"

type RegionCountrySectionProps = {
  region: Region
}

type Country = {
  id: number
  iso_2: string
  iso_3: string
  num_code: number
  name: string
  display_name: string
}

const PREFIX = "c"
const PAGE_SIZE = 10

export const RegionCountrySection = ({ region }: RegionCountrySectionProps) => {
  const { t } = useTranslation()
  const prompt = usePrompt()

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const { searchParams, raw } = useCountryTableQuery({
    pageSize: PAGE_SIZE,
    prefix: PREFIX,
  })
  const { countries, count } = useCountries({
    countries: region.countries || [],
    ...searchParams,
  })

  const columns = useColumns()

  const { table } = useDataTable({
    data: countries || [],
    columns,
    count,
    enablePagination: true,
    enableRowSelection: true,
    getRowId: (row) => row.iso_2,
    pageSize: PAGE_SIZE,
    rowSelection: {
      state: rowSelection,
      updater: setRowSelection,
    },
    prefix: PREFIX,
    meta: {
      region,
    },
  })

  const { mutateAsync } = useAdminUpdateRegion(region.id)

  const handleRemoveCountries = async () => {
    const ids = Object.keys(rowSelection).filter((k) => rowSelection[k])

    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("regions.removeCountriesWarning", {
        count: ids.length,
      }),
      verificationText: t("actions.remove"),
      verificationInstruction: t("general.typeToConfirm"),
      cancelText: t("actions.cancel"),
      confirmText: t("actions.remove"),
    })

    if (!res) {
      return
    }

    const payload = region.countries
      .filter((c) => !ids.includes(c.iso_2))
      .map((c) => c.iso_2)

    await mutateAsync({
      countries: payload,
    })
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">{t("fields.countries")}</Heading>
        <ActionMenu
          groups={[
            {
              actions: [
                {
                  label: t("regions.addCountries"),
                  icon: <PlusMini />,
                  to: "countries/add",
                },
              ],
            },
          ]}
        />
      </div>
      <DataTable
        table={table}
        columns={columns}
        pageSize={PAGE_SIZE}
        count={count}
        orderBy={["name", "code"]}
        search
        pagination
        queryObject={raw}
        prefix={PREFIX}
        commands={[
          {
            action: handleRemoveCountries,
            label: t("actions.remove"),
            shortcut: "r",
          },
        ]}
      />
    </Container>
  )
}

const CountryActions = ({
  country,
  region,
}: {
  country: Country
  region: Region
}) => {
  const { t } = useTranslation()
  const prompt = usePrompt()
  const { mutateAsync } = useAdminUpdateRegion(region.id)

  const payload = region.countries
    ?.filter((c) => c.iso_2 !== country.iso_2)
    .map((c) => c.iso_2)

  const handleRemove = async () => {
    const res = await prompt({
      title: t("general.areYouSure"),
      description: t("regions.removeCountryWarning", {
        name: country.display_name,
      }),
      verificationText: country.display_name,
      verificationInstruction: t("general.typeToConfirm"),
      cancelText: t("actions.cancel"),
      confirmText: t("actions.remove"),
    })

    if (!res) {
      return
    }

    await mutateAsync({
      countries: payload,
    })
  }

  return (
    <ActionMenu
      groups={[
        {
          actions: [
            {
              label: t("actions.remove"),
              onClick: handleRemove,
              icon: <Trash />,
            },
          ],
        },
      ]}
    />
  )
}

const columnHelper = createColumnHelper<Country>()

const useColumns = () => {
  const base = useCountryTableColumns()

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
      ...base,
      columnHelper.display({
        id: "actions",
        cell: ({ row, table }) => {
          const { region } = table.options.meta as { region: Region }

          return <CountryActions country={row.original} region={region} />
        },
      }),
    ],
    [base]
  ) as ColumnDef<Country>[]
}
