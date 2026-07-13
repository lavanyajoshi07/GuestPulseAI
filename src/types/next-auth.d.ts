import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasHomestay?: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    hasHomestay?: boolean;
  }
}
