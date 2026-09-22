import { expect, test } from "@playwright/test";
import type { Entry, Item } from "../src/types/api";

test("catalogue, compte, collection et statistiques à 375 px et sur ordinateur", async ({ page }) => {
  const item: Item = {
    id: 1, titre: "Celeste", categorie: "Plateforme", description: "Une ascension.",
    image_url: "", annee: 2018, studio: "Maddy Makes Games", plateforme: "PC",
  };
  let entries: Entry[] = [];
  await page.route("http://localhost:8000/**", async route => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    let data: unknown;
    let status = 200;
    if (url.pathname === "/auth/register") {
      status = 201;
      data = { id: 1, email: "player@example.com" };
    } else if (url.pathname === "/auth/login") {
      data = { access_token: "browser-test-token", token_type: "bearer" };
    } else if (url.pathname === "/auth/me") {
      data = { id: 1, email: "player@example.com" };
    } else if (url.pathname === "/items") {
      const matches = !url.searchParams.get("q") || item.titre.toLowerCase().includes(url.searchParams.get("q")!.toLowerCase());
      data = { total: matches ? 1 : 0, page: 1, limit: Number(url.searchParams.get("limit") ?? 12), results: matches ? [item] : [] };
    } else if (url.pathname === "/items/1") {
      data = item;
    } else if (url.pathname === "/me/collection" && method === "POST") {
      entries = [{ id: 1, item, statut: "a_decouvrir", note: null, commentaire: null, date_ajout: new Date().toISOString() }];
      status = 201;
      data = entries[0];
    } else if (url.pathname === "/me/collection/1" && method === "PATCH") {
      entries[0] = { ...entries[0], ...route.request().postDataJSON() };
      data = entries[0];
    } else if (method === "DELETE") {
      entries = [];
      await route.fulfill({ status: 204 });
      return;
    } else if (url.pathname === "/me/collection") {
      data = entries;
    } else if (url.pathname === "/me/stats") {
      data = { total: entries.length, par_statut: { a_decouvrir: 0, en_cours: 0, termine: entries.length }, note_moyenne: entries.length ? 5 : null };
    } else {
      throw new Error("Unexpected API call: " + url.pathname);
    }
    await route.fulfill({ status, json: data });
  });
  await page.goto("/collection");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("link", { name: "Créer un compte" }).click();
  await page.getByLabel("Adresse e-mail").fill("player@example.com");
  await page.getByLabel("Mot de passe", { exact: true }).fill("motdepassefort");
  await page.getByLabel("Confirmer le mot de passe").fill("motdepassefort");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await page.getByLabel("Adresse e-mail").fill("player@example.com");
  await page.getByLabel("Mot de passe", { exact: true }).fill("motdepassefort");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByText("Aucun jeu dans cette sélection")).toBeVisible();
  await page.getByRole("link", { name: "Explorer le catalogue" }).click();
  await page.getByLabel("Rechercher un jeu").fill("missing");
  await expect(page.getByText("Aucun jeu ne correspond à la recherche.")).toBeVisible();
  await page.getByLabel("Rechercher un jeu").fill("Celeste");
  await page.getByLabel("Filtrer par genre").selectOption("Plateforme");
  await page.getByRole("button", { name: "Ma collection : Celeste" }).click();
  await expect(page.getByRole("button", { name: "Ma collection : Celeste" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Ma collection", exact: false }).first().click();
  await page.getByRole("combobox", { name: "Statut", exact: true }).last().selectOption("termine");
  await page.getByRole("combobox", { name: "Note", exact: true }).selectOption("5");
  await page.getByLabel("Commentaire").fill("Excellent");
  await page.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(page.getByText("Modifications enregistrées.")).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "Statistiques" }).click();
  await expect(page.getByText("5.0 / 5")).toBeVisible();
  await page.getByRole("link", { name: "Ma collection", exact: false }).first().click();
  await page.getByRole("button", { name: "Supprimer" }).click();
  await expect(page.getByText("Aucun jeu dans cette sélection")).toBeVisible();
  await page.getByRole("button", { name: "Se déconnecter" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("une API indisponible affiche une erreur et propose de réessayer", async ({ page }) => {
  await page.route("http://localhost:8000/**", route => route.abort());
  await page.goto("/catalogue");
  await expect(page.getByRole("alert").first()).toContainText("Impossible de joindre");
  await expect(page.getByRole("button", { name: "Réessayer" }).first()).toBeVisible();
});
