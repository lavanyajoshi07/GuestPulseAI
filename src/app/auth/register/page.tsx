import RegisterForm from '@/components/RegisterForm';
import ShaderBackground from '@/components/ShaderBackground';

export const metadata = {
  title: 'Create Account - GuestPulseAI',
  description: 'Create a new GuestPulseAI account',
};

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-y-auto">
      <ShaderBackground />
      <RegisterForm />
    </main>
  );
}
