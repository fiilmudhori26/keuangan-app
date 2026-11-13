import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, isDatabaseConfigured } from "./db";
import * as schema from "./db/schema";

const googleId = process.env.GOOGLE_CLIENT_ID;
const googleSecret = process.env.GOOGLE_CLIENT_SECRET;

export const auth = isDatabaseConfigured && db
  ? betterAuth({
      appName: "Keuangan",
      baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
      secret: process.env.BETTER_AUTH_SECRET,
      trustedOrigins: [
        "http://localhost:3000",
        "https://keuangan-app-self.vercel.app",
        "https://keuangan-app-fiilmudhori26s-projects.vercel.app",
        "https://keuangan-app-git-main-fiilmudhori26s-projects.vercel.app",
      ],
      database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
      emailAndPassword: { enabled: true, minPasswordLength: 8 },
      socialProviders:
        googleId && googleSecret
          ? { google: { clientId: googleId, clientSecret: googleSecret } }
          : undefined,
      session: { expiresIn: 60 * 60 * 24 * 30 },
      databaseHooks: {
        user: {
          create: {
            after: async (user) => {
              const { seedUserData } = await import("./db/seed-user");
              await seedUserData(user.id, user.name);
            },
          },
        },
      },
    })
  : null;
