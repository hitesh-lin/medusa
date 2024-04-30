import { useTranslation } from "react-i18next"
import { Filter } from "../../../../../components/table/data-table"

export const useApiKeyManagementTableFilters = () => {
  const { t } = useTranslation()

  let filters: Filter[] = []

  const dateFilters: Filter[] = [
    { label: t("fields.createdAt"), key: "created_at" },
    { label: t("fields.updatedAt"), key: "updated_at" },
    { label: t("fields.revokedAt"), key: "revoked_at" },
  ].map((f) => ({
    key: f.key,
    label: f.label,
    type: "date",
  }))

  filters = [...filters, ...dateFilters]

  return filters
}
