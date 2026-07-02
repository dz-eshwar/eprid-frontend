import { LoginForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Log in — E-PRid" };

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <LoginForm />
    </div>
  );
}
