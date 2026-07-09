/**
 * Maps forensics check names (from the backend) to i18n message keys under
 * the "forensicsExplanations" namespace. Matching is by prefix so "Timestamp
 * check (Site photo)" and "Timestamp check (Invoice)" both resolve correctly.
 */

const EXPLANATION_KEYS: Array<{ prefix: string; key: string }> = [
  { prefix: "GPS location", key: "gpsLocation" },
  { prefix: "Timestamp check", key: "timestampCheck" },
  { prefix: "PDF creation date check", key: "pdfCreationDate" },
  { prefix: "PDF modification date consistency", key: "pdfModificationConsistency" },
  { prefix: "PDF authorship metadata", key: "pdfAuthorship" },
  { prefix: "Device identification", key: "deviceIdentification" },
  { prefix: "Reverse image duplicate check", key: "reverseImageDuplicate" },
  { prefix: "EXIF extraction", key: "exifExtraction" },
  { prefix: "e-invoice QR originality", key: "einvoiceQrOriginality" },
];

export function getExplanationKey(checkName: string): string | null {
  const match = EXPLANATION_KEYS.find(({ prefix }) =>
    checkName.toLowerCase().startsWith(prefix.toLowerCase())
  );
  return match?.key ?? null;
}
