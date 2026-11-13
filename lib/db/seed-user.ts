import { requireDb } from "../db";
import * as schema from "../db/schema";
import { DEFAULT_CATEGORIES } from "../types";
import { uid } from "../utils";

/** Creates the profile + default categories when a real user signs up. */
export async function seedUserData(userId: string, displayName: string) {
  const db = requireDb();
  await db.insert(schema.profiles).values({
    userId,
    displayName: displayName.slice(0, 60),
    currency: "IDR",
    monthStartDay: 1,
    theme: "system",
  });
  await db.insert(schema.categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      id: uid("cat"),
      userId,
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isArchived: false,
    })),
  );
}
