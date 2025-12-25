import { httpGetJson } from "./http";

export type ValueGroup = {
  market_hash_name: string;
  total_amount: number;

  // image
  sample_icon_url?: string | null;

  // prices (might be absent depending on backend lookups)
  unit_price?: number | null;
  group_price?: number | null;

  // альтернативні назви (про всяк випадок)
  price?: number | null;
  total?: number | null;
};

export type ValueResponse = {
  currency: number;
  total_value: number;
  steam_lookups: number;
  groups: ValueGroup[];
};

export async function getValueBySteamId(
  steamId: string
): Promise<{ items: ValueGroup[]; total: number }> {
  const raw = await httpGetJson<ValueResponse>(
    `/api/value/${encodeURIComponent(steamId)}`
  );

  return {
    items: Array.isArray(raw.groups) ? raw.groups : [],
    total: Number(raw.total_value ?? 0) || 0,
  };
}
