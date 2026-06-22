import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Sign In - ReviewLens AI',
  description: 'Sign in to ReviewLens AI',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background flex items-center justify-center px-4 transition-colors duration-300">
      <LoginForm />
    </main>
  );
}
