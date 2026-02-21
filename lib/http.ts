export async function parseResponse<T = any>(res: Response): Promise<{ ok: boolean; status: number; json: T | null; text: string }> {
  const text = await res.text();
  let json: T | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // ignore json parse error
  }
  return { ok: res.ok, status: res.status, json, text };
}
