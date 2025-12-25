import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { getValueBySteamId } from "../api/value";
import type { ValueGroup } from "../api/value";

function formatMoney(x: number) {
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(2);
}

function getSteamImage(url: string | null) {
  if (!url) return null;
  if (url.includes("/360fx360f")) return url;
  if (url.includes("/economy/image/")) return `${url}/360fx360f`;
  return url;
}

type SortKey = "name" | "amount" | "unit" | "group";
type SortDir = "asc" | "desc";
type ViewMode = "table" | "grid";

export default function InventoryPage() {
  const [steamId, setSteamId] = useState("");
  const [items, setItems] = useState<ValueGroup[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ViewMode>("grid");

  const [sortKey, setSortKey] = useState<SortKey>("group");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const rows = useMemo(() => {
    return items.map((g) => {
      const name = g.market_hash_name ?? "Unknown item";
      const amount = Number(g.total_amount ?? 0) || 0;

      const unit = Number(g.unit_price ?? g.price ?? 0) || 0;
      const group = Number(g.group_price ?? g.total ?? 0) || amount * unit;

      const img = getSteamImage(g.sample_icon_url ?? null);

      return { key: name, name, amount, unit, group, img };
    });
  }, [items]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "amount") return (a.amount - b.amount) * dir;
      if (sortKey === "unit") return (a.unit - b.unit) * dir;
      return (a.group - b.group) * dir;
    });

    return copy;
  }, [rows, sortKey, sortDir]);

  const selectedSummary = useMemo(() => {
    let count = 0;
    let value = 0;
    for (const r of rows) {
      if (selected.has(r.key)) {
        count += 1;
        value += Number(r.group) || 0;
      }
    }
    return { count, value };
  }, [rows, selected]);

  function toggleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("desc");
      return;
    }
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
  }

  function sortBadge(key: SortKey) {
    if (sortKey !== key) return "↕";
    return sortDir === "desc" ? "↓" : "↑";
  }

  function toggleSelected(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function selectAll() {
    setSelected(() => new Set(rows.map((r) => r.key)));
  }

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
      setSelected(new Set());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setItems([]);
      setTotal(0);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ color: "#fff", margin: "0 0 12px" }}>Inventory</h1>

      <div style={toolbar}>
        <input
          id="steamId"
          name="steamId"
          autoComplete="off"
          value={steamId}
          onChange={(e) => setSteamId(e.target.value)}
          placeholder="SteamID (e.g. 7656119...)"
          style={input}
        />

        <button onClick={onFetch} disabled={loading} style={primaryBtn(loading)}>
          {loading ? "Loading..." : "Fetch"}
        </button>

        <div style={segWrap}>
          <div
            style={{
              ...segPill,
              transform: view === "table" ? "translateX(0)" : "translateX(100%)",
            }}
          />
          <button onClick={() => setView("table")} style={segBtn(view === "table")}>
            Table
          </button>
          <button onClick={() => setView("grid")} style={segBtn(view === "grid")}>
            Cards
          </button>
        </div>

        <div style={{ marginLeft: "auto", color: "rgba(255,255,255,0.85)" }}>
          <b>Items:</b> {items.length} &nbsp; | &nbsp; <b>Total value:</b>{" "}
          {formatMoney(total)}
        </div>
      </div>

      <div style={selectionBar}>
        <div style={{ color: "rgba(255,255,255,0.85)" }}>
          <b>Selected:</b> {selectedSummary.count} &nbsp; | &nbsp;{" "}
          <b>Selected value:</b> {formatMoney(selectedSummary.value)}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={selectAll} disabled={rows.length === 0} style={ghostBtn(rows.length === 0)}>
            Select all
          </button>
          <button onClick={clearSelection} disabled={selected.size === 0} style={ghostBtn(selected.size === 0)}>
            ✕ Clear
          </button>
        </div>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {view === "grid" ? (
        <div style={gridWrap}>
          {sortedRows.length === 0 ? (
            <div style={{ color: "rgba(255,255,255,0.7)" }}>No items yet.</div>
          ) : (
            sortedRows.map((r) => {
              const isSel = selected.has(r.key);

              return (
                <div
                  key={r.key}
                  onClick={() => toggleSelected(r.key)}
                  style={{
                    ...card,
                    borderColor: isSel ? "rgba(59,130,246,0.75)" : "rgba(255,255,255,0.14)",
                    boxShadow: isSel ? "0 0 0 2px rgba(59,130,246,0.25)" : "none",
                  }}
                >
                  <div style={cardImageArea}>
                    {r.img ? <img src={r.img} alt={r.name} loading="lazy" style={cardImg} /> : null}

                    <div style={amountBadgeWrap}>
                      <div style={amountBadgeRing(isSel)}>
                        <div style={amountBadgeInner}>
                          <span style={amountBadgeText}>{r.amount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={cardName} title={r.name}>
                    {r.name}
                  </div>

                  <div style={cardBottom}>
                    <div style={labelsRow}>
                      <div style={priceLabel}>UNIT PRICE</div>
                      <div style={priceLabel}>TOTAL VALUE</div>
                    </div>

                    <div style={valuesRow}>
                      <div style={unitValue}>{formatMoney(r.unit)}</div>
                      <div style={totalValue}>{formatMoney(r.group)}</div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={tableWrap}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.06)" }}>
                <th style={th} />
                <th style={thClickable} onClick={() => toggleSort("name")}>
                  Name {sortBadge("name")}
                </th>
                <th style={thClickableRight} onClick={() => toggleSort("amount")}>
                  Amount {sortBadge("amount")}
                </th>
                <th style={thClickableRight} onClick={() => toggleSort("unit")}>
                  Unit price {sortBadge("unit")}
                </th>
                <th style={thClickableRight} onClick={() => toggleSort("group")}>
                  Total value {sortBadge("group")}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedRows.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ ...td, color: "rgba(255,255,255,0.7)" }}>
                    No items yet.
                  </td>
                </tr>
              ) : (
                sortedRows.map((r) => {
                  const isSel = selected.has(r.key);
                  return (
                    <tr
                      key={r.key}
                      onClick={() => toggleSelected(r.key)}
                      style={{
                        cursor: "pointer",
                        background: isSel ? "rgba(59,130,246,0.07)" : "transparent",
                        outline: isSel ? "2px solid rgba(59,130,246,0.55)" : "2px solid transparent",
                        outlineOffset: -2, // selection like before
                      }}
                      onMouseEnter={(e) => {
                        if (isSel) return;
                        (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)";
                      }}
                      onMouseLeave={(e) => {
                        if (isSel) return;
                        (e.currentTarget as HTMLTableRowElement).style.background = "transparent";
                      }}
                    >
                      <td style={tdPhoto}>
                        <div style={thumbWrap(isSel)}>
                          {r.img ? <img src={r.img} alt={r.name} loading="lazy" style={thumbImg} /> : null}
                        </div>
                      </td>
                      <td style={tdText}>{r.name}</td>
                      <td style={tdRight}>{r.amount}</td>
                      <td style={tdRight}>{formatMoney(r.unit)}</td>
                      <td style={tdRightStrong}>{formatMoney(r.group)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---------------- styles ---------------- */

const toolbar: CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
  marginBottom: 12,
  flexWrap: "wrap",
};

const input: CSSProperties = {
  width: 360,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.06)",
  color: "#fff",
  outline: "none",
};

function primaryBtn(loading: boolean): CSSProperties {
  return {
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: loading ? "rgba(255,255,255,0.08)" : "rgba(59,130,246,0.85)",
    color: "#fff",
    padding: "10px 12px",
    cursor: loading ? "not-allowed" : "pointer",
  };
}

/* segmented */
const segWrap: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  alignItems: "center",
  width: 190,
  padding: 4,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.05)",
  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
};

const segPill: CSSProperties = {
  position: "absolute",
  top: 4,
  left: 4,
  width: "calc(50% - 4px)",
  height: "calc(100% - 8px)",
  borderRadius: 999,
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.14)",
  transition: "transform 180ms ease",
  boxShadow: "0 8px 18px rgba(0,0,0,0.25)",
};

function segBtn(active: boolean): CSSProperties {
  return {
    zIndex: 1,
    padding: "8px 10px",
    border: "none",
    background: "transparent",
    color: active ? "#fff" : "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontWeight: 900,
    fontSize: 13,
  };
}

const selectionBar: CSSProperties = {
  marginBottom: 12,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

function ghostBtn(disabled: boolean): CSSProperties {
  return {
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    padding: "8px 10px",
    cursor: disabled ? "not-allowed" : "pointer",
    fontSize: 13,
    opacity: disabled ? 0.55 : 1,
  };
}

const errorBox: CSSProperties = {
  marginBottom: 12,
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgba(239,68,68,0.35)",
  background: "rgba(239,68,68,0.12)",
  color: "#fff",
};

/* grid */
const gridWrap: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 14,
};

const card: CSSProperties = {
  borderRadius: 16,
  border: "3px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.03)",
  padding: 16,
  cursor: "pointer",
  transition: "border-color 140ms ease, box-shadow 140ms ease, background 140ms ease",
  minWidth: 0,
};

const cardImageArea: CSSProperties = {
  position: "relative",
  width: "100%",
  height: 220,
  borderRadius: 14,
  border: "3px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const cardImg: CSSProperties = {
  maxWidth: "92%",
  maxHeight: "92%",
  objectFit: "contain",
  imageRendering: "auto",
};

/* amount badge: centered + inner fill reaches ring evenly */
const amountBadgeWrap: CSSProperties = {
  position: "absolute",
  top: 10,
  right: 10,
  width: 30,
  height: 30,
  pointerEvents: "none",
  display: "grid",
  placeItems: "center",
};

function amountBadgeRing(selected: boolean): CSSProperties {
  return {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    border: selected ? "2px solid rgba(59,130,246,0.85)" : "2px solid rgba(255,255,255,0.28)",
    background: selected ? "rgba(59,130,246,0.18)" : "transparent",
    display: "grid",
    placeItems: "center",
    boxShadow: selected ? "0 10px 16px rgba(59,130,246,0.14)" : "0 8px 14px rgba(0,0,0,0.25)",
  };
}

const amountBadgeInner: CSSProperties = {
  width: "calc(100% - 4px)",
  height: "calc(100% - 4px)",
  borderRadius: 999,
  background: "linear-gradient(180deg, rgba(17,24,39,0.92), rgba(15,23,42,0.92))",
  border: "1px solid rgba(255,255,255,0.10)",
  display: "grid",
  placeItems: "center",
};

const amountBadgeText: CSSProperties = {
  fontWeight: 950,
  fontSize: 12,
  color: "#fff",
  textShadow: "0 1px 0 rgba(0,0,0,0.55)",
};

const cardName: CSSProperties = {
  marginTop: 12,
  fontWeight: 900,
  fontSize: 14,
  color: "#fff",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const cardBottom: CSSProperties = {
  marginTop: 14,
  display: "grid",
  gap: 6,
};

const labelsRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const valuesRow: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
};

const priceLabel: CSSProperties = {
  fontSize: 11,
  letterSpacing: 0.8,
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.60)",
  fontWeight: 900,
};

const unitValue: CSSProperties = {
  fontSize: 14,
  fontWeight: 900,
  color: "#fff",
};

const totalValue: CSSProperties = {
  fontSize: 20,
  fontWeight: 950,
  color: "#fff",
};

/* table */
const tableWrap: CSSProperties = {
  overflowX: "auto",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};

const thBase: CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
  fontWeight: 800,
  userSelect: "none",
  whiteSpace: "nowrap",
};

const th: CSSProperties = thBase;
const thClickable: CSSProperties = { ...thBase, cursor: "pointer" };
const thClickableRight: CSSProperties = { ...thBase, textAlign: "right", cursor: "pointer" };

const td: CSSProperties = {
  padding: "12px 12px",
  color: "rgba(255,255,255,0.85)",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const tdPhoto: CSSProperties = { ...td, width: 92 };
const tdText: CSSProperties = { ...td, color: "#fff" };
const tdRight: CSSProperties = { ...td, textAlign: "right" };
const tdRightStrong: CSSProperties = { ...td, textAlign: "right", color: "#fff", fontWeight: 900 };

function thumbWrap(selected: boolean): CSSProperties {
  return {
    width: 64,
    height: 64,
    borderRadius: 12,
    background: "rgba(255,255,255,0.06)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: selected ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.08)",
  };
}

const thumbImg: CSSProperties = {
  maxWidth: "100%",
  maxHeight: "100%",
  objectFit: "contain",
  imageRendering: "auto",
};
