import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { expect, test, vi } from "vitest";
import { AuthProvider } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { api } from "../services/api";

function renderProtected(): void {
  render(
    <MemoryRouter initialEntries={["/stats"]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<h1>Connexion requise</h1>} />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <h1>Privé</h1>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

test("une route privée redirige les visiteurs", async () => {
  renderProtected();
  expect(await screen.findByText("Connexion requise")).toBeInTheDocument();
});

test("une session validée par l'API accède à la route privée", async () => {
  localStorage.setItem("ma-collection:token", JSON.stringify("test-token"));
  vi.spyOn(api, "me").mockResolvedValue({ id: 1, email: "player@example.com" });
  renderProtected();
  expect(await screen.findByText("Privé")).toBeInTheDocument();
});
