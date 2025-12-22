export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "";

export async function httpGetJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    // читаємо текст, щоб показати нормальну помилку
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`);
  }

  return (await res.json()) as T;
}
