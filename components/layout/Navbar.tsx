"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { EPRidMark } from "@/components/branding/EPRidLogo";

export function Navbar() {
  const { user, clearAuth } = useAuth();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <nav className="bg-[#0F6E56] text-white px-6 py-4 flex items-center justify-between shadow-sm">
      <Link href="/" className="flex items-center gap-2">
        <EPRidMark size={28} color="#ffffff" />
        <span className="text-xl font-bold tracking-tight">
          EPR<span className="text-[#D85A30]">I</span>d
        </span>
        <span className="hidden sm:inline text-sm font-normal opacity-75">
          Battery EPR Verification
        </span>
      </Link>

      <div className="flex items-center gap-6 text-sm">
        {user?.role !== "RECYCLER" && (
          <Link href="/calculator" className="opacity-90 hover:opacity-100 font-medium">
            Calculator
          </Link>
        )}
        {user?.role !== "RECYCLER" && (
          <Link href="/verify" className="opacity-90 hover:opacity-100 font-medium">
            Verify
          </Link>
        )}
        <Link href="/vault" className="opacity-90 hover:opacity-100 font-medium">
          Vault
        </Link>

        {user ? (
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <Link href="/dashboard" className="opacity-75 hover:opacity-100 font-medium">
              Dashboard
            </Link>
            <div className="flex items-center gap-1.5 text-white/80">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 opacity-75 hover:opacity-100 transition-opacity"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 border-l border-white/20 pl-4">
            <Link href="/login" className="opacity-90 hover:opacity-100 font-medium">
              Log in
            </Link>
            <Link
              href="/register"
              className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-md font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
