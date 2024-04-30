export const defaultAdminRegionRelations = ["countries"]
export const allowedAdminRegionRelations = ["countries"]
export const defaultAdminRegionFields = [
  "id",
  "name",
  "currency_code",
  "created_at",
  "updated_at",
  "deleted_at",
  "metadata",
  "countries.id",
  "countries.iso_2",
  "countries.iso_3",
  "countries.num_code",
  "countries.name",
]

export const retrieveTransformQueryConfig = {
  defaultFields: defaultAdminRegionFields,
  defaultRelations: defaultAdminRegionRelations,
  allowedRelations: allowedAdminRegionRelations,
  isList: false,
}

export const listTransformQueryConfig = {
  defaultLimit: 20,
  isList: true,
}
