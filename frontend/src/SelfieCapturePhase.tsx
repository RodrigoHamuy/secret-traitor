import { useEffect, useRef, useState } from 'react';

import { SelfieCaptureScreen } from './components/screens/SelfieCaptureScreen';
import { useGame } from './game/store';

// Crop the live camera frame to a centred square; SelfieStage mirrors the preview, so
// mirror the capture too for a true selfie.
function grabSquare(video: HTMLVideoElement): string {
  const size = 768;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const vw = video.videoWidth || size;
  const vh = video.videoHeight || size;
  const s = Math.min(vw, vh);
  ctx.translate(size, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, size, size);
  return c.toDataURL('image/jpeg', 0.92);
}

export function SelfieCapturePhase() {
  const name = useGame((s) => s.players[s.passIndex]?.name ?? '');
  const snapSelfie = useGame((s) => s.snapSelfie);
  const skipSelfie = useGame((s) => s.skipSelfie);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const stop = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(true);
      return stop;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 1280 } }, audio: false })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  const onSnap = () => {
    const v = videoRef.current;
    if (!v) return;
    const photo = grabSquare(v);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    snapSelfie(photo);
  };

  return (
    <SelfieCaptureScreen
      playerName={name}
      cameraError={error}
      snapEnabled={ready}
      onSnap={onSnap}
      onSkip={skipSelfie}
      stage={error ? null : <video ref={videoRef} autoPlay playsInline muted />}
    />
  );
}
