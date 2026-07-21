import type { SQLiteDatabase } from "expo-sqlite";

export type FavouriteRow = {
  date: string; // YYYY-MM-DD
  order: number; // reading order within the day
  createdAt: string; // ISO datetime
};

export type HydratedFavourite = {
  date: string;
  order: number;
  createdAt: string;
  reference: string;
  text: string;
};

export async function addFavourite(
  db: SQLiteDatabase,
  date: string,
  order: number,
): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO Favourite (date, "order") VALUES (?, ?)`,
    [date, order],
  );
}

export async function removeFavourite(
  db: SQLiteDatabase,
  date: string,
  order: number,
): Promise<void> {
  await db.runAsync(
    `DELETE FROM Favourite WHERE date = ? AND "order" = ?`,
    [date, order],
  );
}

export async function hydrateFavourites(
  db: SQLiteDatabase,
  favourites: FavouriteRow[],
  language: string,
  version: string,
): Promise<HydratedFavourite[]> {
  if (favourites.length === 0) return [];

  const whereParts: string[] = [];
  const params: (string | number)[] = [];
  params.push(language, version);
  for (const fav of favourites) {
    whereParts.push('(f.date = ? AND f."order" = ?)');
    params.push(fav.date, fav.order);
  }

  return db.getAllAsync<HydratedFavourite>(
    `SELECT f.date, f."order", f.createdAt, r.reference, r.text
     FROM Favourite f
     LEFT JOIN Reading r ON r.date = f.date AND r."order" = f."order" AND r.language = ? AND r.version = ?
     WHERE ${whereParts.join(" OR ")}
     ORDER BY f.createdAt DESC`,
    params,
  );
}

export async function clearAll(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`DELETE FROM Favourite`);
}
