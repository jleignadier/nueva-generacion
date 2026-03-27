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

      const qrContent = `${eventId}:${newToken}`;
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
        const qrContent = `${eventId}:${existingToken}`;
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
          {qrDataUrl ? (
            <>
              <div className="bg-white p-4 rounded-lg">
                <img src={qrDataUrl} alt="QR Code" className="w-64 h-64" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Los voluntarios deben escanear este código para registrar su asistencia.
              </p>
              <Button
                variant="destructive"
                onClick={deactivateQR}
                disabled={loading}
                className="w-full"
              >
                <X size={16} className="mr-2" />
                Desactivar QR
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventQRDialog;
