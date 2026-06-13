export interface SelfiePreviewProps {
  src: string;
}

/** Captured selfie shown inside the SelfieStage for confirmation. */
export function SelfiePreview({ src }: SelfiePreviewProps) {
  return <img className="block h-full w-full object-cover" src={src} alt="" />;
}
