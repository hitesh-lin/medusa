import { Modules } from "@medusajs/modules-sdk"
import { ModuleJoinerConfig } from "@medusajs/types"
import { LINKS } from "../links"

export const ShippingOptionPriceSet: ModuleJoinerConfig = {
  serviceName: LINKS.ShippingOptionPriceSet,
  isLink: true,
  databaseConfig: {
    tableName: "shipping_option_price_set",
    idPrefix: "sops",
  },
  alias: [
    {
      name: ["shipping_option_price_set", "shipping_option_price_sets"],
      args: {
        entity: "LinkShippingOptionPriceSet",
      },
    },
  ],
  primaryKeys: ["id", "shipping_option_id", "price_set_id"],
  relationships: [
    {
      serviceName: Modules.FULFILLMENT,
      primaryKey: "id",
      foreignKey: "shipping_option_id",
      alias: "shipping_option",
      args: {
        methodSuffix: "ShippingOptions",
      },
    },
    {
      serviceName: Modules.PRICING,
      primaryKey: "id",
      foreignKey: "price_set_id",
      alias: "price_set",
      deleteCascade: true,
    },
  ],
  extends: [
    {
      serviceName: Modules.FULFILLMENT,
      relationship: {
        serviceName: LINKS.ShippingOptionPriceSet,
        primaryKey: "shipping_option_id",
        foreignKey: "id",
        alias: "price",
      },
    },
    {
      serviceName: Modules.PRICING,
      relationship: {
        serviceName: LINKS.ShippingOptionPriceSet,
        primaryKey: "price_set_id",
        foreignKey: "id",
        alias: "shipping_option_link",
      },
      fieldAlias: {
        shipping_option: "shipping_option_link.shipping_option",
      },
    },
  ],
}
