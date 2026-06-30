import { CalculatorForm } from "@/components/calculator/CalculatorForm";

export const metadata = {
  title: "EPR Obligation Calculator — E-PRid",
};

export default function CalculatorPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#444441]">EPR Obligation Calculator</h1>
        <p className="mt-1 text-sm text-[#444441]/60">
          BWMR 2022, Rule 10(4) / Schedule II — battery waste recovery targets
        </p>
      </div>
      <CalculatorForm />
    </div>
  );
}
