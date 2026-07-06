import { UsedOilAssistantForm } from "@/components/usedoil/UsedOilAssistantForm";

export const metadata = {
  title: "Used Oil CA-1/CA-2 Registration Assistant — E-PRid",
};

export default function UsedOilPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#444441]">Used Oil Registration Assistant</h1>
        <p className="mt-1 text-sm text-[#444441]/60">
          CPCB CA-1/CA-2 collection agent registration guidance — informational only, no login required.
        </p>
      </div>
      <UsedOilAssistantForm />
    </div>
  );
}
