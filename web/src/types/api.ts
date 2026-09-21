export type Item = { id: number; titre: string; categorie: string; description: string; image_url: string; annee: number; studio: string; plateforme: string };
export type PaginatedItems = { total: number; page: number; limit: number; results: Item[] };
