"use client";

import { Suspense } from "react";
import { VerifyFlow } from "@/components/verify/VerifyFlow";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyFlow />
    </Suspense>
  );
}
