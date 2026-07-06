"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/AuthContext";
import * as authApi from "@/lib/api/auth";
import type { UserRole } from "@/lib/api/types";

// ─── Login ────────────────────────────────────────────────────────────────────

export function LoginForm() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.login({ email, password });
      setAuth(result);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <h1 className="text-xl font-bold text-[#444441] mb-6">Log in to E-PRid</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field label="Password" type="password" value={password} onChange={setPassword} required />
        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Log in
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#444441]/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#0F6E56] font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </Card>
  );
}

// ─── Register ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: UserRole; label: string; desc: string }[] = [
  {
    value: "PUBLISHER",
    label: "Publisher / Producer",
    desc: "I place batteries on the market and need to meet EPR obligations.",
  },
  {
    value: "RECYCLER",
    label: "Recycler",
    desc: "I collect and process batteries and issue recycling certificates.",
  },
];

export function RegisterForm() {
  const { setAuth } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PUBLISHER");
  const [gstin, setGstin] = useState("");
  const [legalName, setLegalName] = useState("");
  const [udyamNumber, setUdyamNumber] = useState("");
  const [cinOrDin, setCinOrDin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authApi.register({
        fullName,
        email,
        password,
        role,
        gstin: role === "RECYCLER" ? (gstin || undefined) : undefined,
        legalName: role === "RECYCLER" ? (legalName || undefined) : undefined,
        udyamNumber: role === "RECYCLER" ? (udyamNumber || undefined) : undefined,
        cinOrDin: role === "RECYCLER" ? (cinOrDin || undefined) : undefined,
      });
      setAuth(result);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <h1 className="text-xl font-bold text-[#444441] mb-6">Create your E-PRid account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" type="text" value={fullName} onChange={setFullName} required />
        <Field label="Email" type="email" value={email} onChange={setEmail} required />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          required
          hint="Minimum 8 characters"
        />

        <div>
          <label className="block text-sm font-medium text-[#444441] mb-2">
            I am a <span className="text-[#A32D2D] ml-0.5">*</span>
          </label>
          <div className="space-y-2">
            {ROLE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                  role === opt.value
                    ? "border-[#0F6E56] bg-[#0F6E56]/5"
                    : "border-black/15 hover:border-black/30"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={opt.value}
                  checked={role === opt.value}
                  onChange={() => setRole(opt.value)}
                  className="mt-0.5 accent-[#0F6E56]"
                />
                <div>
                  <p className="text-sm font-medium text-[#444441]">{opt.label}</p>
                  <p className="text-xs text-[#444441]/60 mt-0.5">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {role === "RECYCLER" && (
          <div className="rounded-md border border-black/10 bg-[#F1EFE8] p-3 space-y-3">
            <p className="text-xs font-semibold text-[#444441]/70">
              Optional — helps us verify your account faster
            </p>
            <Field label="GSTIN" type="text" value={gstin} onChange={setGstin} />
            <Field label="Legal business name" type="text" value={legalName} onChange={setLegalName} />
            <Field label="Udyam registration number" type="text" value={udyamNumber} onChange={setUdyamNumber} />
            <Field label="CIN / DIN (if incorporated)" type="text" value={cinOrDin} onChange={setCinOrDin} />
          </div>
        )}

        {error && <ErrorMsg>{error}</ErrorMsg>}
        <Button type="submit" variant="primary" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-[#444441]/60">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0F6E56] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </Card>
  );
}

// ─── Shared sub-components ───────────────────────────────────────────────────

function Field({
  label,
  hint,
  ...props
}: {
  label: string;
  hint?: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#444441] mb-1">
        {label}
        {props.required && <span className="text-[#A32D2D] ml-0.5">*</span>}
      </label>
      <input
        {...props}
        onChange={(e) => props.onChange(e.target.value)}
        className="w-full rounded-md border border-black/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
      />
      {hint && <p className="mt-1 text-xs text-[#444441]/50">{hint}</p>}
    </div>
  );
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-[#A32D2D] bg-[#A32D2D]/5 border border-[#A32D2D]/20 rounded-md px-3 py-2">
      {children}
    </p>
  );
}
