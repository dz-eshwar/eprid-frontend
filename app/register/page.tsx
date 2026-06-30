import { RegisterForm } from "@/components/auth/AuthForm";

export const metadata = { title: "Sign up — E-PRid" };

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <RegisterForm />
    </div>
  );
}
