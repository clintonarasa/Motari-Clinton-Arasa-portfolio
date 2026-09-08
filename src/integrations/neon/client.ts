type QueryResult<T = unknown> = { data: T; error: Error | null; count?: number | null };

type Filter = { column: string; value: unknown };
type Operation = "select" | "insert" | "update" | "delete";

const LOCAL_USER_ID = "00000000-0000-0000-0000-000000000001";

function request<T>(url: string, options?: RequestInit): Promise<QueryResult<T>> {
  return fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  }).then(async (response) => {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) return { data: null as T, error: new Error(body.error || response.statusText) };
    if (options?.method && options.method !== "GET") {
      const timestamp = String(Date.now());
      localStorage.setItem("portfolio-data-updated", timestamp);
      window.dispatchEvent(new CustomEvent("portfolio-data-updated", { detail: timestamp }));
    }
    return { data: body.data as T, count: body.count, error: null };
  });
}

class QueryBuilder implements PromiseLike<QueryResult<unknown>> {
  private operation: Operation = "select";
  private payload: unknown;
  private filters: Filter[] = [];
  private ordering?: { column: string; ascending: boolean };
  private rowLimit?: number;
  private head = false;
  private returnRows = false;
  private isSingle = false;

  constructor(private readonly table: string) {}

  select(_columns = "*", options?: { count?: "exact"; head?: boolean }) {
    this.returnRows = true;
    this.head = Boolean(options?.head);
    return this;
  }

  insert(rows: unknown[]) {
    this.operation = "insert";
    this.payload = rows;
    return this;
  }

  upsert(row: unknown) {
    this.operation = "insert";
    this.payload = [row];
    return this;
  }

  update(values: unknown) {
    this.operation = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.ordering = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(value: number) {
    this.rowLimit = value;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  then<TResult1 = QueryResult<unknown>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<unknown>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    const params = new URLSearchParams({ table: this.table, operation: this.operation });
    if (this.filters.length) params.set("filters", JSON.stringify(this.filters));
    if (this.ordering) params.set("order", JSON.stringify(this.ordering));
    if (this.rowLimit) params.set("limit", String(this.rowLimit));
    if (this.head) params.set("head", "true");
    if (this.isSingle) params.set("single", "true");

    const method = this.operation === "select" ? "GET" : this.operation === "delete" ? "DELETE" : "POST";
    const body = this.operation === "select" || this.operation === "delete" ? undefined : JSON.stringify({ payload: this.payload });
    return request(`/api/neon?${params}`, { method, body }).then((result) => {
      if (this.isSingle) return { ...result, data: Array.isArray(result.data) ? result.data[0] || null : result.data };
      return result;
    }).then(onfulfilled, onrejected);
  }
}

export const supabase = {
  from: (table: string) => new QueryBuilder(table),
  auth: {
    getUser: async () => ({ data: { user: localStorage.getItem("__local_admin_session__") ? { id: LOCAL_USER_ID, email: localStorage.getItem("__local_admin_email__") || "admin" } : null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => undefined } } }),
    signOut: async () => { localStorage.removeItem("__local_admin_session__"); return { error: null }; },
    updateUser: async () => ({ data: null, error: new Error("Password reset is not configured for local authentication") }),
  },
  storage: {
    from: (bucket: string) => ({
      upload: async (filePath: string, file: File) => {
        const response = await fetch("/api/neon-upload", { method: "POST", credentials: "include", headers: { "Content-Type": file.type, "X-Upload-Path": `${bucket}/${filePath}` }, body: file });
        return { error: response.ok ? null : new Error("Upload failed") };
      },
      getPublicUrl: (filePath: string) => ({ data: { publicUrl: `/uploads/${bucket}/${filePath}` } }),
    }),
  },
  removeChannel: () => undefined,
};

export async function uploadPortfolioAsset(file: File, kind: string) {
  const response = await fetch("/api/neon-upload", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": file.type, "X-Upload-Path": `${kind}/${file.name}` },
    body: file,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Upload failed");
  return body.data as { id: string; publicUrl: string };
}

export { LOCAL_USER_ID };
