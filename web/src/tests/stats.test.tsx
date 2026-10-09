import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, test } from "vitest";
import { StatsOverview } from "../components/StatsOverview";
import { Stats } from "../types/api";

function showStats(data: Stats): void {
  render(
    <MemoryRouter>
      <StatsOverview data={data} />
    </MemoryRouter>,
  );
}

test("la progression et les statuts reflètent les statistiques de l'API", () => {
  showStats({
    total: 8,
    par_statut: { a_decouvrir: 3, en_cours: 3, termine: 2 },
    note_moyenne: 4.25,
  });
  expect(screen.getByRole("img")).toHaveAccessibleName(
    "2 jeux terminés sur 8, soit 25 %",
  );
  expect(screen.getByText("4.3 / 5")).toBeInTheDocument();
  expect(screen.getByRole("progressbar", { name: "Terminé" })).toHaveAttribute(
    "value",
    "2",
  );
  expect(screen.getByRole("progressbar", { name: "Terminé" })).toHaveAttribute(
    "max",
    "8",
  );
});

test("une collection vide propose le catalogue sans progression trompeuse", () => {
  showStats({
    total: 0,
    par_statut: { a_decouvrir: 0, en_cours: 0, termine: 0 },
    note_moyenne: null,
  });
  expect(screen.getByText("Aucune note")).toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Explorer le catalogue →" }),
  ).toHaveAttribute("href", "/catalogue");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
});

test("une collection terminée affiche 100 % même sans note", () => {
  showStats({
    total: 3,
    par_statut: { a_decouvrir: 0, en_cours: 0, termine: 3 },
    note_moyenne: null,
  });
  expect(screen.getByRole("img")).toHaveAccessibleName(
    "3 jeux terminés sur 3, soit 100 %",
  );
  expect(screen.getByText("Aucune note")).toBeInTheDocument();
});
