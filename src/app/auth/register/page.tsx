import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Create Account - GuestPulseAI',
  description: 'Create a new GuestPulseAI account',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-background dark:from-blue-950/15 dark:via-background dark:to-background flex items-center justify-center px-4 transition-colors duration-300">
      <RegisterForm />
    </main>
  );
}
