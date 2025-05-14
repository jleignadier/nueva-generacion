
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [accountType, setAccountType] = useState<'individual' | 'organization'>('individual');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const name = accountType === 'individual' 
        ? `${firstName} ${lastName}` 
        : orgName;
        
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-nuevagen-blue to-nuevagen-teal">
      <Card className="w-full max-w-md mx-4 p-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center mb-6">
          <img 
            src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
            alt="Nueva Generación Logo" 
            className="h-24 w-auto" 
          />
          <h2 className="mt-4 text-center text-3xl font-bold text-nuevagen-blue">
            Create Account
          </h2>
          <p className="text-center text-gray-600 mt-2">
            Join our volunteer community
          </p>
        </div>

        <div className="mb-6 rounded-lg overflow-hidden gradient-toggle-container">
          <ToggleGroup
            type="single"
            value={accountType}
            onValueChange={(value) => value && setAccountType(value as 'individual' | 'organization')}
            className="w-full"
          >
            <ToggleGroupItem 
              value="individual"
              className={`flex-1 py-3 text-center transition-colors rounded-none ${
                accountType === 'individual' 
                  ? 'text-white font-bold' 
                  : 'bg-white/80 text-gray-600 hover:bg-white/70'
              }`}
            >
              Individual
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="organization"
              className={`flex-1 py-3 text-center transition-colors rounded-none ${
                accountType === 'organization' 
                  ? 'text-white font-bold' 
                  : 'bg-white/80 text-gray-600 hover:bg-white/70'
              }`}
            >
              Organization
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 text-base"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-12 text-base"
              />
            </div>
          </div>

          {accountType === 'individual' ? (
            <>
              <div>
                <Input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full h-12 text-base"
                />
              </div>

              <div>
                <Input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full h-12 text-base"
                />
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full h-12 text-base"
                />
              </div>
            </>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                className="w-full h-12 text-base"
              />
            </div>
          )}

          <div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 bg-nuevagen-blue hover:bg-opacity-90 text-white font-medium rounded-lg"
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">Already have an account? </span>
            <Link to="/login" className="font-medium text-nuevagen-blue hover:text-nuevagen-teal">
              Log in
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
