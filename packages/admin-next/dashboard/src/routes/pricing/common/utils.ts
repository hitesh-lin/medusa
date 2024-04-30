import { PriceList } from "@medusajs/medusa"
import { TFunction } from "i18next"
import { PriceListStatus } from "./constants"

const getValues = (priceList: PriceList) => {
  const startsAt = priceList.starts_at
  const endsAt = priceList.ends_at

  const isExpired = endsAt ? new Date(endsAt) < new Date() : false
  const isScheduled = startsAt ? new Date(startsAt) > new Date() : false
  const isDraft = priceList.status === PriceListStatus.DRAFT

  return {
    isExpired,
    isScheduled,
    isDraft,
  }
}

export const getPriceListStatus = (
  t: TFunction<"translation">,
  priceList: PriceList
) => {
  const { isExpired, isScheduled, isDraft } = getValues(priceList)

  let text = t("pricing.status.active")
  let color: "red" | "grey" | "orange" | "green" = "green"

  if (isScheduled) {
    color = "orange"
    text = t("pricing.status.scheduled")
  }

  if (isDraft) {
    color = "grey"
    text = t("pricing.status.draft")
  }

  if (isExpired) {
    color = "red"
    text = t("pricing.status.expired")
  }

  return {
    color,
    text,
  }
}
