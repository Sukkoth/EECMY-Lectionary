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

let favourites: FavouriteRow[] = [];

async function reloadCache(db: SQLiteDatabase): Promise<void> {
  favourites = await db.getAllAsync<FavouriteRow>(
    `SELECT * FROM Favourite ORDER BY createdAt DESC`,
  );
}

export async function loadFavourites(db: SQLiteDatabase): Promise<void> {
  await reloadCache(db);
}

export async function addFavourite(
  db: SQLiteDatabase,
  date: string,
  order: number,
): Promise<void> {
  await db.runAsync(
    `INSERT OR IGNORE INTO Favourite (date, "order") VALUES (?, ?)`,
    [date, order],
  );
  await reloadCache(db);
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
  await reloadCache(db);
}

/**
 * Optimistically add to the in-memory cache (no DB operation).
 * Used for instant UI feedback before the async DB write completes.
 */
export function optimisticAdd(date: string, order: number): void {
  if (!favourites.some((f) => f.date === date && f.order === order)) {
    favourites = [{ date, order, createdAt: new Date().toISOString() }, ...favourites];
  }
}

/**
 * Optimistically remove from the in-memory cache (no DB operation).
 * Used for instant UI feedback before the async DB delete completes.
 */
export function optimisticRemove(date: string, order: number): void {
  favourites = favourites.filter((f) => !(f.date === date && f.order === order));
}

export function isFavourite(date: string, order: number): boolean {
  return favourites.some((f) => f.date === date && f.order === order);
}

export function getFavourites(): FavouriteRow[] {
  return favourites;
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
  // JOIN params first (they appear first in the SQL)
  params.push(language, version);
  // WHERE params after (one pair per favourite)
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
  favourites = [];
}
