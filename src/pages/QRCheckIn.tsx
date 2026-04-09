import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

type CheckInState = 'loading' | 'success' | 'duplicate' | 'invalid' | 'error' | 'login-redirect';

const QRCheckIn: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [state, setState] = useState<CheckInState>('loading');
  const [message, setMessage] = useState('');
  const [attempted, setAttempted] = useState(false);

  const eventId = searchParams.get('event');
  const token = searchParams.get('token');

  // If not logged in, save params and redirect to login
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      if (eventId && token) {
        sessionStorage.setItem('pending-qr-checkin', JSON.stringify({ eventId, token }));
      }
      setState('login-redirect');
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, eventId, token, navigate]);

  // Perform check-in
  useEffect(() => {
    if (authLoading || !user || attempted) return;
    if (!eventId || !token) {
      setState('invalid');
      setMessage('El enlace QR no es válido. Faltan parámetros.');
      return;
    }

    setAttempted(true);

    (async () => {
      try {
        const { error } = await supabase.rpc('award_event_points', {
          p_user_id: user.id,
          p_event_id: eventId,
          p_check_in_method: 'qr_scan' as const,
          p_qr_token: token,
        });

        if (error) {
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('already') || msg.includes('duplicate') || msg.includes('ya registr')) {
            setState('duplicate');
            setMessage('Ya registraste tu asistencia para este evento.');
          } else if (msg.includes('token') || msg.includes('qr') || msg.includes('activ')) {
            setState('invalid');
            setMessage('El código QR no es válido o ha expirado.');
          } else {
            setState('error');
            setMessage(error.message || 'Ocurrió un error al registrar la asistencia.');
          }
          return;
        }

        setState('success');
        setMessage('¡Tu asistencia ha sido registrada exitosamente!');
        toast({ title: '¡Asistencia registrada!', description: 'Se te han otorgado los puntos del evento.' });
      } catch (err: any) {
        setState('error');
        setMessage(err.message || 'Error inesperado.');
      }
    })();
  }, [user, authLoading, eventId, token, attempted, toast]);

  if (authLoading || state === 'login-redirect') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const icons: Record<CheckInState, React.ReactNode> = {
    loading: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
    success: <CheckCircle className="h-12 w-12 text-green-500" />,
    duplicate: <AlertTriangle className="h-12 w-12 text-yellow-500" />,
    invalid: <XCircle className="h-12 w-12 text-destructive" />,
    error: <XCircle className="h-12 w-12 text-destructive" />,
    'login-redirect': null,
  };

  const titles: Record<CheckInState, string> = {
    loading: 'Registrando asistencia...',
    success: '¡Asistencia Registrada!',
    duplicate: 'Ya Registrado',
    invalid: 'QR Inválido',
    error: 'Error',
    'login-redirect': '',
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-background p-4">
      <Card className="w-full max-w-sm p-8 flex flex-col items-center gap-4 text-center">
        {icons[state]}
        <h1 className="text-xl font-bold text-foreground">{titles[state]}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {state !== 'loading' && (
          <Button className="mt-4 w-full" onClick={() => navigate('/dashboard')}>
            Ir al Inicio
          </Button>
        )}
      </Card>
    </div>
  );
};

export default QRCheckIn;
