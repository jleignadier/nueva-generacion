
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for existing organizations - in a real app, this would come from an API
const mockOrganizations = [
  { id: '1', name: 'Eco Guardians' },
  { id: '2', name: 'Ocean Defenders' },
  { id: '3', name: 'Wildlife Protectors' },
  { id: '4', name: 'Community Builders' },
  { id: '5', name: 'Tech for Good' },
];

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [joinOrg, setJoinOrg] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
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

    if (isAdmin && adminKey !== "admin2024") {
      toast({
        title: "Invalid Admin Key",
        description: "The admin key you entered is not valid",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const name = accountType === 'individual' 
        ? `${firstName} ${lastName}` 
        : orgName;
        
      const finalAccountType = isAdmin ? 'admin' : accountType;
      
      // Include organization info if the user is joining an org
      const orgInfo = joinOrg && accountType === 'individual' && selectedOrgId 
        ? { organizationId: selectedOrgId } 
        : undefined;
        
      const user = await signup(email, password, name, finalAccountType as any, orgInfo);
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nuevagen-blue to-nuevagen-teal py-6">
      <Card className="w-full max-w-md mx-4 p-5 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center justify-center mb-4">
          <img 
            src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
            alt="Nueva Generación Logo" 
            className="h-20 w-auto" 
          />
          <h2 className="mt-2 text-center text-2xl font-bold text-nuevagen-blue">
            Create Account
          </h2>
          <p className="text-center text-gray-600 text-sm mt-1">
            Join our volunteer community
          </p>
        </div>

        <div className="mb-4 rounded-lg overflow-hidden gradient-toggle-container">
          <ToggleGroup
            type="single"
            value={accountType}
            onValueChange={(value) => {
              if (value && !isAdmin) {
                setAccountType(value as 'individual' | 'organization');
                // Reset join org option when switching to organization account type
                if (value === 'organization') {
                  setJoinOrg(false);
                }
              }
            }}
            className="w-full"
            disabled={isAdmin}
          >
            <ToggleGroupItem 
              value="individual"
              className={`flex-1 py-2 text-center transition-colors rounded-none ${
                accountType === 'individual' && !isAdmin
                  ? 'text-white font-bold' 
                  : 'bg-white/80 text-gray-600 hover:bg-white/70'
              } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Individual
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="organization"
              className={`flex-1 py-2 text-center transition-colors rounded-none ${
                accountType === 'organization' && !isAdmin
                  ? 'text-white font-bold' 
                  : 'bg-white/80 text-gray-600 hover:bg-white/70'
              } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Organization
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mb-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield size={16} className={isAdmin ? "text-purple-600" : "text-gray-400"} />
              <Label htmlFor="admin-mode" className="font-medium text-sm">
                Admin Account
              </Label>
            </div>
            <Switch 
              id="admin-mode" 
              checked={isAdmin} 
              onCheckedChange={setIsAdmin}
            />
          </div>
          
          {isAdmin && (
            <div className="mt-3">
              <Label htmlFor="admin-key" className="text-xs text-gray-500 mb-1 block">
                Admin Key
              </Label>
              <Input
                id="admin-key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required={isAdmin}
                placeholder="Enter admin key"
                className="text-sm h-8"
              />
              <p className="text-xs text-gray-400 mt-1">
                For demo use: "admin2024"
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-10 text-sm pr-10"
              />
              <button 
                type="button" 
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-10 text-sm"
              />
            </div>
          </div>

          {!isAdmin && accountType === 'individual' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isAdmin && accountType === 'individual'}
                    className="w-full h-10 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isAdmin && accountType === 'individual'}
                    className="w-full h-10 text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="mm/dd/yyyy"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full h-10 text-sm"
                />
              </div>

              {/* Organization Membership Option */}
              <div className="mt-3 p-3 border border-gray-100 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="join-org" className="font-medium text-sm">
                    Join an Organization
                  </Label>
                  <Switch 
                    id="join-org" 
                    checked={joinOrg} 
                    onCheckedChange={setJoinOrg}
                  />
                </div>
                
                {joinOrg && (
                  <div className="mt-3">
                    <Label htmlFor="org-select" className="text-xs text-gray-700 mb-1 block">
                      Select Organization
                    </Label>
                    <Select 
                      value={selectedOrgId} 
                      onValueChange={setSelectedOrgId}
                    >
                      <SelectTrigger id="org-select" className="w-full h-9 text-sm">
                        <SelectValue placeholder="Select an organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockOrganizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      You'll be able to participate in the organization's events
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : !isAdmin && accountType === 'organization' ? (
            <div>
              <Input
                type="text"
                placeholder="Organization Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required={!isAdmin && accountType === 'organization'}
                className="w-full h-10 text-sm"
              />
            </div>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Admin Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required={isAdmin}
                className="w-full h-10 text-sm"
              />
            </div>
          )}

          <div>
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || (joinOrg && !selectedOrgId)}
            className={`w-full h-10 ${isAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-nuevagen-blue hover:bg-opacity-90'} text-white font-medium rounded-lg text-sm`}
          >
            {isLoading ? "Creating Account..." : "Sign Up"}
          </Button>

          <div className="text-center text-xs mt-3">
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
