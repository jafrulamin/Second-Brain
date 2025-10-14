// TODO: Configure NextAuth (v5) with the GitHub provider.
// - Read AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET from env
// - Export GET and POST handlers per App Router conventions
// Docs: https://authjs.dev/ (NextAuth v5, App Router)


// apps/web/app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from "@/auth";
