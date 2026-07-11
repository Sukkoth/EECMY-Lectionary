import type { SQLiteDatabase } from "expo-sqlite";

export type FavouriteRow = {
  date: string; // YYYY-MM-DD
  order: number; // reading order within the day
  createdAt: string; // ISO datetime
};

let favourites: FavouriteRow[] = [];

export async function ensureFavouriteTable(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS Favourite (
      date TEXT NOT NULL,
      "order" INTEGER NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (date, "order")
    )
  `);
}

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

export function isFavourite(date: string, order: number): boolean {
  return favourites.some((f) => f.date === date && f.order === order);
}

export function getFavourites(): FavouriteRow[] {
  return favourites;
}

export async function clearAll(db: SQLiteDatabase): Promise<void> {
  await db.runAsync(`DELETE FROM Favourite`);
  favourites = [];
}
