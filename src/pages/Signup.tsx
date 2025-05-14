
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signup(email, password, name, accountType);
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: "Signup Failed",
        description: error || "Please check your information and try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center justify-center">
          <img 
            src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
            alt="Nueva Generación Logo" 
            className="h-24 w-auto" 
          />
          <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
            Join Nueva Generación
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Sign up to start volunteering and making a difference
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Account Type
                </label>
                <RadioGroup 
                  value={accountType}
                  onValueChange={(val) => setAccountType(val as 'individual' | 'organization')}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Individual</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organization" id="organization" />
                    <Label htmlFor="organization">Organization</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-6"
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-gray-600">Already have an account? </span>
                <Link to="/login" className="font-medium text-nuevagen-blue hover:text-nuevagen-teal">
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
