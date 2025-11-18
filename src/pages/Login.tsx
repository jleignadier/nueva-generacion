import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { authStorage } from '@/utils/authStorage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, user, resendConfirmation } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log("Login page mounted, user state:", user?.email);
  }, [user]);

  // Check if user just verified email
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'signup' && params.get('token_hash')) {
      toast({
        title: "¡Correo verificado!",
        description: "Ahora puedes iniciar sesión con tu cuenta",
      });
      // Clear the URL parameters
      window.history.replaceState({}, '', '/login');
    }
  }, [toast]);

  // If user is already logged in, redirect to appropriate dashboard
  if (user) {
    console.log("Login: User already logged in, redirecting");
    return <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted with email:", email);
    setIsLoading(true);
    
    try {
      // Set storage preference before login
      authStorage.setRememberMe(rememberMe);
      
      const user = await login(email, password);
      // Navigation will be handled by the auth state change
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Login form error:", err);
      const errorMessage = error || "Please check your credentials and try again.";
      
      // Show resend confirmation option if email not confirmed
      if (errorMessage.includes('confirma tu correo') || errorMessage.includes('Email not confirmed')) {
        setShowResendConfirmation(true);
      }
      
      toast({
        title: "Error de Inicio de Sesión",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico primero.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmation(email);
      toast({
        title: "Correo Enviado",
        description: "Te hemos enviado un nuevo correo de confirmación. Revisa tu bandeja de entrada.",
      });
      setShowResendConfirmation(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "No pudimos enviar el correo de confirmación. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToReset = resetEmail || email;
    
    if (!emailToReset) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu correo electrónico.",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(emailToReset, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Correo Enviado",
        description: "Te hemos enviado un correo con instrucciones para restablecer tu contraseña.",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (err) {
      toast({
        title: "Error",
        description: "No pudimos enviar el correo de restablecimiento. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        title: "Correo requerido",
        description: "Por favor ingresa tu correo electrónico",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (error) throw error;

      toast({
        title: "Correo reenviado",
        description: "Revisa tu bandeja de entrada y tu carpeta de spam",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo reenviar el correo",
        variant: "destructive"
      });
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nuevagen-blue to-nuevagen-teal">
      <Card className="w-full max-w-md mx-4 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center mb-8">
          <img 
            src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
            alt="Nueva Generación Logo" 
            className="h-24 w-auto" 
          />
          <h2 className="mt-4 text-center text-3xl font-bold text-nuevagen-blue">
            Bienvenido
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Inicia tu Sesión
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo Electrónico"
              required
              className="w-full h-12 text-base"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
              className="w-full h-12 text-base pr-10"
            />
            <button 
              type="button" 
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => setShowForgotPassword(!showForgotPassword)}
              className="text-sm text-nuevagen-blue hover:text-nuevagen-teal font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="remember-me"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember-me"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Mantener sesión iniciada
            </label>
          </div>

          {showResendConfirmation && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-2">
                Tu correo no está verificado. ¿No recibiste el correo de confirmación?
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                className="w-full text-nuevagen-blue border-nuevagen-blue hover:bg-nuevagen-blue hover:text-white"
              >
                Reenviar correo de verificación
              </Button>
            </div>
          )}
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-nuevagen-blue hover:bg-opacity-90 text-white font-medium rounded-lg"
          >
            {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
          </Button>

          {showForgotPassword && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 mb-3">
                Ingresa tu correo electrónico para restablecer tu contraseña
              </p>
              <Input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="Correo Electrónico"
                className="w-full h-10 mb-3"
              />
              <Button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResettingPassword}
                className="w-full h-10 text-sm bg-nuevagen-blue hover:bg-opacity-90"
              >
                {isResettingPassword ? "Enviando..." : "Enviar Correo de Restablecimiento"}
              </Button>
            </div>
          )}

          {showResendConfirmation && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-3">
                ¿No has recibido el correo de confirmación?
              </p>
              <Button
                type="button"
                onClick={handleResendConfirmation}
                disabled={isResending}
                variant="outline"
                className="w-full h-10 text-sm"
              >
                {isResending ? "Enviando..." : "Reenviar Correo de Confirmación"}
              </Button>
            </div>
          )}
          
          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">¿No tienes cuenta? </span>
            <Link to="/signup" className="font-medium text-nuevagen-blue hover:text-nuevagen-teal">
              Regístrate Ya
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
