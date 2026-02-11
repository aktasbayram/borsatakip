import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "Giriş Yap",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "user@example.com" },
                password: { label: "Şifre", type: "password" },
            },
            authorize: async (credentials) => {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!user || !user.password) {
                    throw new Error("Kullanıcı bulunamadı veya şifre hatalı.");
                }

                // Verify password
                const bcrypt = require('bcryptjs');
                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Şifre hatalı.");
                }

                return user;
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
                session.user.subscriptionTier = token.subscriptionTier as string;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
                token.role = user.role;
                token.subscriptionTier = user.subscriptionTier;
            }

            if (trigger === "update" && session?.name) {
                token.name = session.name;
            }

            return token;
        }
    },
    session: {
        strategy: "jwt"
    },
    basePath: "/api/auth",
    secret: process.env.NEXTAUTH_SECRET,
})
