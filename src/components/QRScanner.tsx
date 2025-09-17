
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface QRScannerProps {
  onSuccess: (result: string) => void;
  onClose: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onSuccess, onClose }) => {
  const [scanning, setScanning] = useState(false);

  // This is a mock implementation that simulates scanning a QR code
  // In a real app, you would use a library like html5-qrcode or react-qr-reader
  useEffect(() => {
    if (scanning) {
      // Simulate scanning process
      const timer = setTimeout(() => {
        // Simulate successful scan with a mock result
        // In a real implementation, this would be the actual QR code value
        const mockResult = 'valid-qr-code';
        onSuccess(mockResult);
        setScanning(false);
      }, 2500); // Simulate 2.5 seconds of scanning
      
      return () => clearTimeout(timer);
    }
  }, [scanning, onSuccess]);

  const startScanning = () => {
    setScanning(true);
    toast({
      title: "Escaneando...",
      description: "Apunta tu cámara al código QR del evento",
    });
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-square bg-gray-100 mb-4 relative">
        {scanning ? (
          <div className="w-full h-full flex items-center justify-center">
            {/* Animated scanning effect */}
            <div className="w-4/5 h-4/5 border-2 border-nuevagen-blue relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-nuevagen-blue animate-bounce"></div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-500 mb-2">La vista previa de la cámara aparecerá aquí</p>
            <p className="text-sm text-gray-400">Por favor permite el acceso a la cámara cuando se solicite</p>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 w-full">
        <Button 
          className="flex-1" 
          onClick={startScanning} 
          disabled={scanning}
        >
          {scanning ? 'Escaneando...' : 'Iniciar Escaneo'}
        </Button>
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Cancelar
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 mt-4 text-center">
        Posiciona el código QR dentro del área de escaneo
      </p>
    </div>
  );
};

export default QRScanner;
