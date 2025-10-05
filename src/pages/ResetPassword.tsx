import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the email link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        toast({
          title: "Error",
          description: "El enlace de restablecimiento es inválido o ha expirado.",
          variant: "destructive",
        });
        navigate('/login');
      }
    });
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido actualizada exitosamente.",
      });

      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "No pudimos actualizar tu contraseña. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            Restablecer Contraseña
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Ingresa tu nueva contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva Contraseña"
              required
              className="w-full h-12 text-base pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Contraseña"
              required
              className="w-full h-12 text-base pr-10"
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-nuevagen-blue hover:bg-opacity-90 text-white font-medium rounded-lg"
          >
            {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPassword;
