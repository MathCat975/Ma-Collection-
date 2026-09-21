export type Item = {
  id: number;
  titre: string;
  categorie: string;
  description: string;
  image_url: string;
  annee: number;
  studio: string;
  plateforme: string;
};
export type PaginatedItems = {
  total: number;
  page: number;
  limit: number;
  results: Item[];
};
export type Statut = "a_decouvrir" | "en_cours" | "termine";
export type User = { id: number; email: string };
export type Credentials = { email: string; password: string };
export type Token = { access_token: string; token_type: string };
export type Entry = {
  id: number;
  statut: Statut;
  note: number | null;
  commentaire: string | null;
  date_ajout: string;
  item: Item;
};
export type EntryUpdate = {
  statut?: Statut;
  note?: number | null;
  commentaire?: string | null;
};
export type Stats = {
  total: number;
  par_statut: Record<Statut, number>;
  note_moyenne: number | null;
};
export type ErrorResponse = { erreur: { code: number; message: string } };
export const statusLabels: Record<Statut, string> = {
  a_decouvrir: "À découvrir",
  en_cours: "En cours",
  termine: "Terminé",
};
