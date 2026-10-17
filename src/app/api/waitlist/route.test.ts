import { beforeEach, describe, expect, it, vi } from "vitest";

const { serverDb } = vi.hoisted(() => ({ serverDb: vi.fn() }));
vi.mock("../../../lib/supabase", () => ({ serverDb }));
import { POST } from "./route";

const request = (body: unknown) =>
  new Request("http://localhost/api/waitlist", {
    method: "POST",
    body: JSON.stringify(body),
  });

describe("waitlist API", () => {
  beforeEach(() => serverDb.mockReset());

  it("rejects invalid addresses before accessing storage", async () => {
    const response = await POST(request({ email: "missing-at-sign" }));
    expect(response.status).toBe(400);
    expect(serverDb).not.toHaveBeenCalled();
  });

  it("reports unavailable storage without claiming a signup", async () => {
    serverDb.mockReturnValue(null);
    const response = await POST(request({ email: "reader@example.com" }));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("joined", true);
  });

  it("normalizes and saves the email for the monthly plan", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    serverDb.mockReturnValue({ from: () => ({ upsert }) });
    const response = await POST(request({ email: "  Reader@Example.com " }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ joined: true });
    expect(upsert).toHaveBeenCalledWith(
      { email: "reader@example.com", plan: "monthly_499_inr" },
      { onConflict: "email", ignoreDuplicates: true },
    );
  });
});
