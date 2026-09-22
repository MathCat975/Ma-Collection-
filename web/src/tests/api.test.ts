import { expect, test, vi } from "vitest";
import { api } from "../services/api";

test("le client transmet le Bearer et accepte une suppression 204", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  await expect(api.remove("session", 42)).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledWith(
    expect.stringContaining("/me/collection/42"),
    expect.objectContaining({
      method: "DELETE",
      headers: { Authorization: "Bearer session" },
    }),
  );
});

test("une erreur 401 traduit le contrat et signale la session expirée", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ erreur: { code: 401, message: "Jeton expiré" } }),
          { status: 401 },
        ),
      ),
  );
  const listener = vi.fn();
  window.addEventListener("auth:expired", listener);
  try {
    await expect(api.me("old-token")).rejects.toMatchObject({
      code: 401,
      message: "Jeton expiré",
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0][0].detail).toBe("old-token");
  } finally {
    window.removeEventListener("auth:expired", listener);
  }
});

test("une panne réseau produit un message exploitable", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new TypeError("Network error")),
  );
  await expect(api.getItem(1)).rejects.toMatchObject({ code: 0 });
});

test("une erreur non JSON reste exploitable", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("Bad gateway", { status: 502 })),
  );
  await expect(api.getItem(1)).rejects.toMatchObject({ code: 502 });
});
