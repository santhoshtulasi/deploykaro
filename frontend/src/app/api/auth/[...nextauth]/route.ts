import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.AUTH_CLIENT_ID || "deploykaro-app",
      clientSecret: process.env.AUTH_CLIENT_SECRET || "local-dev-secret",
      issuer: process.env.AUTH_ISSUER || "http://localhost:8080/realms/deploykaro",
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.idToken = account.id_token
      }
      return token
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken
      return session
    }
  }
})

export { handler as GET, handler as POST }
