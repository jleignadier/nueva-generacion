import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, X } from 'lucide-react';
import QRCode from 'qrcode';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EventQRDialogProps {
  eventId: string;
  eventTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

const EventQRDialog: React.FC<EventQRDialogProps> = ({ eventId, eventTitle, isOpen, onClose }) => {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activateQR = async () => {
    setLoading(true);
    try {
      const newToken = crypto.randomUUID();

      const { error } = await supabase
        .from('events')
        .update({ qr_active_token: newToken } as any)
        .eq('id', eventId);

      if (error) throw error;

      setToken(newToken);

      const qrContent = `${window.location.origin}/qr-check-in?event=${eventId}&token=${newToken}`;
      const dataUrl = await QRCode.toDataURL(qrContent, {
        width: 400,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' },
      });
      setQrDataUrl(dataUrl);

      toast({ title: 'QR activado', description: 'Los voluntarios ya pueden escanear para registrar asistencia.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo activar el QR', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const deactivateQR = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('events')
        .update({ qr_active_token: null } as any)
        .eq('id', eventId);

      if (error) throw error;

      setToken(null);
      setQrDataUrl(null);

      toast({ title: 'QR desactivado', description: 'La asistencia por QR ha sido cerrada.' });
      onClose();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo desactivar el QR', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Check if QR is already active when opening
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('qr_active_token' as any)
        .eq('id', eventId)
        .single();

      const existingToken = (data as any)?.qr_active_token;
      if (existingToken) {
        setToken(existingToken);
        const qrContent = `${window.location.origin}/qr-check-in?event=${eventId}&token=${existingToken}`;
        const dataUrl = await QRCode.toDataURL(qrContent, {
          width: 400,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
        });
        setQrDataUrl(dataUrl);
      } else {
        setToken(null);
        setQrDataUrl(null);
      }
    })();
  }, [isOpen, eventId]);

  // Lock body scroll while fullscreen overlay is open
  useEffect(() => {
    if (isOpen && qrDataUrl) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isOpen, qrDataUrl]);

  // Fullscreen QR display once activated
  if (isOpen && qrDataUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-zinc-900 font-medium truncate">
            <QrCode size={20} />
            <span className="truncate">QR de Asistencia — {eventTitle}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="p-2 rounded-md text-zinc-700 hover:bg-zinc-100"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <img
            src={qrDataUrl}
            alt="QR Code"
            className="object-contain"
            style={{ width: 'min(80vw, 80vh)', height: 'min(80vw, 80vh)' }}
          />
        </div>

        <div className="px-4 pb-6 pt-2 flex flex-col items-center gap-3">
          <p className="text-sm text-zinc-600 text-center">
            Los voluntarios pueden escanear con la cámara del teléfono o con el escáner de la app.
          </p>
          <Button
            variant="destructive"
            onClick={deactivateQR}
            disabled={loading}
            className="w-full max-w-md"
          >
            <X size={16} className="mr-2" />
            Desactivar QR
          </Button>
        </div>
      </div>
    );
  }

  // Pre-activation: small modal with the activation prompt
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-popover border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-popover-foreground flex items-center gap-2">
            <QrCode size={20} />
            QR de Asistencia — {eventTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Activa el código QR para permitir que los voluntarios registren su asistencia escaneándolo.
          </p>
          <Button
            onClick={activateQR}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <QrCode size={16} className="mr-2" />
            {loading ? 'Activando...' : 'Activar QR'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventQRDialog;
