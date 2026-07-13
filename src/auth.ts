import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Homestay from '@/models/Homestay';
import { cookies } from 'next/headers';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID || 'placeholder',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET || 'placeholder',
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID || 'placeholder',
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET || 'placeholder',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          await connectDB();
          const email = user.email?.toLowerCase();
          if (!email) return false;

          let dbUser = await User.findOne({ email });
          
          const cookieStore = await cookies();
          const flow = cookieStore.get('auth_flow')?.value || 'login';

          if (flow === 'register') {
            if (dbUser) {
              // User already exists, log them in but notify frontend
              cookieStore.set('oauth_message', 'already_registered', { maxAge: 60, path: '/' });
              user.id = dbUser._id.toString();
              return true;
            } else {
              // Create user
              dbUser = await User.create({
                email,
                name: user.name || 'OAuth Guest',
                password: Math.random().toString(36).slice(-10) + 'OAuth123!',
              });
              user.id = dbUser._id.toString();
              return true;
            }
          } else {
            // Flow is login
            if (dbUser) {
              user.id = dbUser._id.toString();
              return true;
            } else {
              // User does not exist, cancel login and notify frontend
              cookieStore.set('oauth_error', 'register_required', { maxAge: 60, path: '/' });
              return false;
            }
          }
        } catch (error) {
          console.error('[NextAuth] Error in signIn callback:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: session.user.email });
          if (dbUser) {
            session.user.id = dbUser._id.toString();
            const homestay = await Homestay.findOne({ ownerId: dbUser._id });
            session.user.hasHomestay = !!homestay;
          }
        } catch (error) {
          console.error('[NextAuth] Error in session callback:', error);
        }
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
});
