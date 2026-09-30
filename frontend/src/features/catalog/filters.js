import { dollarsToCents } from "@/lib/format";

/** Friendly URL values ↔ API enum values. */
export const SORTS = [
  { value: "", api: "NEWEST", label: "Newest" },
  { value: "price_asc", api: "PRICE_ASC", label: "Price: Low to High" },
  { value: "price_desc", api: "PRICE_DESC", label: "Price: High to Low" },
];

export const FILTER_FIELDS = ["q", "style", "level", "instructor", "minPrice", "maxPrice", "sort"];

/** Reads the catalog's URL params (prices in whole dollars) into API query params (cents). */
export function toApiFilters(params) {
  return {
    q: params.get("q") || undefined,
    style: params.get("style") || undefined,
    level: params.get("level") || undefined,
    instructorId: params.get("instructor") || undefined,
    minPriceCents: dollarsToCents(params.get("minPrice")) ?? undefined,
    maxPriceCents: dollarsToCents(params.get("maxPrice")) ?? undefined,
    sort: SORTS.find((sort) => sort.value === (params.get("sort") ?? ""))?.api,
  };
}
