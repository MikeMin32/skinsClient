import { useMemo, useState } from "react";
import { getValueBySteamId } from "../api/value";
import type { ValueItem } from "../api/value";


function formatMoney(x: number) {
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(2);
}

export default function InventoryPage() {
  const [steamId, setSteamId] = useState("");
  const [items, setItems] = useState<ValueItem[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    return items.map((it) => {
      const name = it.market_hash_name ?? it.name ?? "Unknown item";
      const amount = Number(it.amount ?? it.count ?? 1) || 1;
      const unit = Number(it.unit_price ?? it.price ?? 0) || 0;
      const group = Number(it.group_price ?? it.total ?? 0) || (amount * unit);

      const img = it.image ?? it.icon_url ?? null;

      return { name, amount, unit, group, img };
    });
  }, [items]);

  async function onFetch() {
    const id = steamId.trim();
    if (!id) {
      setError("Enter SteamID first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await getValueBySteamId(id);
      setItems(res.items);
      setTotal(res.total);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 12px" }}>Inventory</h1>

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
        <input
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          placeholder="SteamID (e.g. 7656119...)"
          style={{
            width: 360,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(255,255,255,0.06)",
            color: "#fff",
            outline: "none",
          }}
        />

        <button
          onClick={onFetch}
          disabled={loading}
          style={{
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.15)",
            background: loading ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.8)",
            color: "#fff",
            padding: "10px 12px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading..." : "Fetch /value"}
        </button>

        <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.85)" }}>
          <b>Total:</b> {formatMoney(total)}
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 10,
            border: "1px solid rgba(239,68,68,0.35)",
            background: "rgba(239,68,68,0.12)",
            color: "#fff",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ overflowX: "auto", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.06)" }}>
              <th style={th}>Photo</th>
              <th style={th}>Name (market_hash_name)</th>
              <th style={thRight}>Amount</th>
              <th style={thRight}>Unit price</th>
              <th style={thRight}>Group price</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...td, color: "rgba(255,255,255,0.7)" }}>
                  No items yet. Enter SteamID and click Fetch.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${r.name}-${idx}`} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={td}>
                    {r.img ? (
                      <img
                        src={r.img}
                        alt={r.name}
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 8 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.08)",
                        }}
                      />
                    )}
                  </td>

                  <td style={{ ...td, color: "#fff" }}>{r.name}</td>
                  <td style={tdRight}>{r.amount}</td>
                  <td style={tdRight}>{formatMoney(r.unit)}</td>
                  <td style={tdRight}>{formatMoney(r.group)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
  fontWeight: 600,
};

const thRight: React.CSSProperties = { ...th, textAlign: "right" };

const td: React.CSSProperties = {
  padding: "10px 12px",
  color: "rgba(255,255,255,0.85)",
  fontSize: 13,
};

const tdRight: React.CSSProperties = { ...td, textAlign: "right" };
