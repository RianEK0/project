import { LoginForm } from '@/features/auth/login-form';

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <div className="contents">
      <LoginForm />
    </div>
  );
}
