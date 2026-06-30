/**
 * Maps forensics check names (from the backend) to plain-language explanations
 * shown as tooltip text on the ⓘ icon in the results UI.
 *
 * Matching is by prefix so "Timestamp check (Site photo)" and
 * "Timestamp check (Invoice)" both resolve correctly.
 */

interface Explanation {
  what: string;   // what the check does
  why: string;    // why it matters / what a failure means
}

const EXPLANATIONS: Array<{ prefix: string; explanation: Explanation }> = [
  {
    prefix: "GPS location",
    explanation: {
      what: "Reads the GPS coordinates hidden inside the image (EXIF data) and checks whether the photo was taken in the same Indian state where this recycler is registered.",
      why: "A recycler registered in Tamil Nadu uploading a photo taken in Delhi is a red flag. If GPS data is missing (common when photos are shared via WhatsApp), the check reports 'unverifiable' — it does not silently pass.",
    },
  },
  {
    prefix: "Timestamp check",
    explanation: {
      what: "Reads the date and time the photo was taken from hidden EXIF metadata, then checks it against the claimed processing date using a tolerance window that depends on document type — site photos must be within ±7 days, invoices within ±30 days, registration certificates just need to predate the batch.",
      why: "A weighbridge slip created 41 days after the processing date, or a site photo taken a month before the batch existed, suggests the document was not produced at the time of processing.",
    },
  },
  {
    prefix: "PDF creation date check",
    explanation: {
      what: "Reads the creation date stored in the PDF's metadata and checks it against the claimed processing date using the tolerance window for this document type.",
      why: "A legitimate weighbridge slip PDF would have been generated on or very close to the processing date. A PDF created weeks later suggests it was typed up retrospectively, even if it claims to document an earlier event.",
    },
  },
  {
    prefix: "PDF modification date consistency",
    explanation: {
      what: "Checks whether the PDF's last-modified date is the same as or after its creation date.",
      why: "If a PDF shows a modification date that is earlier than its creation date, that is technically impossible under normal circumstances and strongly indicates the metadata has been manually altered — a common method used to backdate documents.",
    },
  },
  {
    prefix: "PDF authorship metadata",
    explanation: {
      what: "Reads the author name and software used to create the PDF from its metadata.",
      why: "Legitimate documents from registered recyclers or certified weighbridge systems usually carry the name of the organisation or software that produced them. An author listed as 'anonymous' or missing entirely does not automatically mean fraud, but it removes one layer of traceability.",
    },
  },
  {
    prefix: "Device identification",
    explanation: {
      what: "Reads the camera make and model from the image's EXIF metadata.",
      why: "This is informational — it tells you what device took the photo. If multiple photos across different batches consistently come from the same personal phone rather than facility CCTV or an official device, that pattern is worth noting.",
    },
  },
  {
    prefix: "Reverse image duplicate check",
    explanation: {
      what: "Computes a visual fingerprint of the image (a perceptual hash) and compares it against every other image already uploaded across all checks in this system.",
      why: "In the plastic EPR fraud cases, recyclers reused the same facility photos across hundreds of certificate claims to make it appear that multiple processing events occurred. If this image is visually identical to one already on file for a different check or recycler, it is a significant red flag.",
    },
  },
  {
    prefix: "EXIF extraction",
    explanation: {
      what: "The system attempted to read the hidden metadata embedded in this image file.",
      why: "If extraction fails entirely, it usually means the file is corrupt, in an unexpected format, or the metadata was deliberately stripped. All downstream checks (GPS, timestamp, device) will be unverifiable as a result.",
    },
  },
];

export function getExplanation(checkName: string): string | null {
  const match = EXPLANATIONS.find(({ prefix }) =>
    checkName.toLowerCase().startsWith(prefix.toLowerCase())
  );
  if (!match) return null;
  const { what, why } = match.explanation;
  return `${what}\n\n${why}`;
}
