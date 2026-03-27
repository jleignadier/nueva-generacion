import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose }) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSucceededRef = useRef(false);

  const startScanning = async () => {
    setError(null);
    setScanning(true);

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          if (hasSucceededRef.current) return;
          hasSucceededRef.current = true;
          scanner.stop().catch(() => {});
          onSuccess(decodedText);
        },
        () => {
          // ignore scan failures (no QR found yet)
        }
      );
    } catch (err: any) {
      setScanning(false);
      if (err?.toString?.().includes('NotAllowedError') || err?.toString?.().includes('Permission')) {
        setError('Permiso de cámara denegado. Por favor permite el acceso a la cámara en la configuración de tu navegador.');
      } else if (err?.toString?.().includes('NotFoundError')) {
        setError('No se encontró ninguna cámara en este dispositivo.');
      } else {
        setError('No se pudo iniciar la cámara. Intenta de nuevo.');
      }
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="qr-reader"
        ref={containerRef}
        className="w-full aspect-square bg-muted rounded-lg overflow-hidden"
        style={{ minHeight: 280 }}
      />

      {error && (
        <div className="text-destructive text-sm text-center px-4">
          <CameraOff className="mx-auto mb-1" size={20} />
          {error}
        </div>
      )}

      {!scanning && !error && (
        <p className="text-muted-foreground text-sm text-center">
          Presiona el botón para activar la cámara y escanear el código QR del evento.
        </p>
      )}

      <div className="flex gap-2 w-full">
        {!scanning && (
          <Button className="flex-1" onClick={startScanning}>
            <Camera size={16} className="mr-2" />
            Iniciar Escaneo
          </Button>
        )}
        {scanning && (
          <Button className="flex-1" disabled>
            Escaneando...
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Posiciona el código QR dentro del área de escaneo
      </p>
    </div>
  );
};

export default QRScanner;
