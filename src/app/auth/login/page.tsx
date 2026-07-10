import LoginForm from '@/components/LoginForm';
import ShaderBackground from '@/components/ShaderBackground';

export const metadata = {
  title: 'Sign In - GuestPulseAI',
  description: 'Sign in to GuestPulseAI',
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-y-auto">
      <ShaderBackground />
      <LoginForm />
    </main>
  );
}
