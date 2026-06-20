export interface SelfiePreviewProps {
  src: string;
}

export function SelfiePreview({ src }: SelfiePreviewProps) {
  return <img className="block h-full w-full object-cover" src={src} alt="" />;
}
