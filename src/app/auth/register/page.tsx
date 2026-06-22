import RegisterForm from '@/components/RegisterForm';

export const metadata = {
  title: 'Create Account - ReviewLens AI',
  description: 'Create a new ReviewLens AI account',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <RegisterForm />
    </main>
  );
}
