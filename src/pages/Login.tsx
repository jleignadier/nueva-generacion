
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: "Login Failed",
        description: error || "Please check your credentials and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nuevagen-blue to-nuevagen-teal">
      <Card className="w-full max-w-md mx-4 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center mb-8">
          <img 
            src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
            alt="Nueva Generación Logo" 
            className="h-16 w-auto" 
          />
          <h2 className="mt-4 text-center text-3xl font-bold text-nuevagen-blue">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full h-12 text-base"
            />
          </div>

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
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
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-nuevagen-blue hover:bg-opacity-90 text-white font-medium rounded-lg"
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          
          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">Don't have an account? </span>
            <Link to="/signup" className="font-medium text-nuevagen-blue hover:text-nuevagen-teal">
              Sign up
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Login;
