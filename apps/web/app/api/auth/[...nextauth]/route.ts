// TODO: Configure NextAuth (v5) with the GitHub provider.
// - Read AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET from env
// - Export GET and POST handlers per App Router conventions
// Docs: https://authjs.dev/ (NextAuth v5, App Router)


import NextAuth, { type AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const authOptions: AuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
