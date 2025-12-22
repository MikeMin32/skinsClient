import { httpGetJson } from "./http";

export type ValueItem = {
  image?: string | null;           // URL картинки (якщо є)
  icon_url?: string | null;        // інколи бек віддає так
  market_hash_name?: string;       // назва/хешнейм
  name?: string;                   // або просто name
  amount?: number;                 // кількість
  count?: number;                  // або count
  unit_price?: number;             // ціна за 1
  price?: number;                  // або price
  group_price?: number;            // amount * unit_price
  total?: number;                  // або total
};

export type ValueResponse =
  | { items: ValueItem[]; total_value?: number; total?: number }
  | { data: ValueItem[]; total_value?: number; total?: number }
  | ValueItem[];

// Робимо максимально “толерантно”, щоб не впасти від формату
export async function getValueBySteamId(steamId: string): Promise<{ items: ValueItem[]; total: number }> {
  const raw = await httpGetJson<ValueResponse>(`/value/${encodeURIComponent(steamId)}`);

  let items: ValueItem[] = [];
  let total = 0;

  if (Array.isArray(raw)) {
    items = raw;
  } else if ("items" in raw && Array.isArray(raw.items)) {
    items = raw.items;
    total = Number(raw.total_value ?? raw.total ?? 0) || 0;
  } else if ("data" in raw && Array.isArray(raw.data)) {
    items = raw.data;
    total = Number(raw.total_value ?? raw.total ?? 0) || 0;
  }

  // якщо бек не дав total — порахуємо з items
  if (!total) {
    total = items.reduce((acc, it) => {
      const amount = Number(it.amount ?? it.count ?? 1) || 1;
      const unit = Number(it.unit_price ?? it.price ?? 0) || 0;
      const group = Number(it.group_price ?? it.total ?? 0) || 0;
      // якщо group вже є — беремо group, інакше рахуємо
      return acc + (group ? group : amount * unit);
    }, 0);
  }

  return { items, total };
}
