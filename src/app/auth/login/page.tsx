import LoginForm from '@/components/LoginForm';

export const metadata = {
  title: 'Sign In - ReviewLens AI',
  description: 'Sign in to ReviewLens AI',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <LoginForm />
    </main>
  );
}
