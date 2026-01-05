
import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { supabase } from '@/integrations/supabase/client';
import { authStorage } from '@/utils/authStorage';

const Signup = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [accountType, setAccountType] = useState<'volunteer' | 'organization'>('volunteer');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [joinOrg, setJoinOrg] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [legalDocuments, setLegalDocuments] = useState<Array<{document_type: string, file_url: string, version: number}>>([]);
  const [rememberMe, setRememberMe] = useState(false);
  const { signup, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getActiveOrganizations, initializeOrganizations } = useOrganizationsStore();

  // Initialize organizations and get active ones
  useEffect(() => {
    initializeOrganizations();
  }, [initializeOrganizations]);

  // Fetch legal documents on mount
  useEffect(() => {
    const fetchLegalDocs = async () => {
      console.log('📄 Fetching legal documents...');
      const { data, error } = await supabase
        .from('legal_documents')
        .select('document_type, file_url, version')
        .eq('is_current', true)
        .order('document_type');
      
      console.log('📄 Legal documents result:', { data, error, count: data?.length });
      
      if (data) {
        setLegalDocuments(data);
      }
    };
    fetchLegalDocs();
  }, []);

  const activeOrganizations = getActiveOrganizations();

  // Redirect if user is already logged in
  const { user } = useAuth();
  if (user) {
    console.log("Signup: User already logged in, redirecting");
    navigate(user.isAdmin ? '/admin/dashboard' : '/home', { replace: true });
    return null;
  }

  const openDocument = (docType: string) => {
    const doc = legalDocuments.find(d => d.document_type === docType);
    if (doc?.file_url) {
      window.open(doc.file_url, '_blank');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Los Passwords no son iguales",
        description: "Asegúrese de poner el mismo Password",
        variant: "destructive"
      });
      return;
    }

    if (!legalAccepted) {
      toast({
        title: "Aceptación Requerida",
        description: "Debes aceptar los documentos legales para continuar",
        variant: "destructive"
      });
      return;
    }

    if (isAdmin && !adminKey.trim()) {
      toast({
        title: "Admin Key Requerida",
        description: "Debe proporcionar una clave de administrador válida",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Set storage preference before signup
      authStorage.setRememberMe(rememberMe);
      
      const name = accountType === 'volunteer'
        ? `${firstName} ${lastName}` 
        : orgName;
        
      const finalAccountType = isAdmin ? 'admin' : accountType;
      
      // Prepare signup data
      const signupData = {
        email,
        password,
        firstName,
        lastName,
        phone: phone,
        birthdate: birthdate,
        accountType: finalAccountType as 'volunteer' | 'organization' | 'admin',
        organizationName: accountType === 'organization' ? orgName : undefined,
        joinOrganizationId: joinOrg && accountType === 'volunteer' && selectedOrgId ? selectedOrgId : undefined,
        adminKey: isAdmin ? adminKey : undefined
      };
        
      const user = await signup(signupData);
      
      // Save legal acceptance records after successful signup
      if (user?.id && legalDocuments.length > 0) {
        const acceptanceRecords = legalDocuments.map(doc => ({
          user_id: user.id,
          document_type: doc.document_type as 'terms_and_privacy' | 'volunteering_rules',
          version_accepted: doc.version,
        }));

        const { error: acceptanceError } = await supabase
          .from('user_legal_acceptance')
          .upsert(acceptanceRecords, {
            onConflict: 'user_id,document_type,version_accepted',
            ignoreDuplicates: true,
          });
        if (acceptanceError) {
          console.error('Error saving legal acceptance:', acceptanceError);
          // Don't block signup, but log the error
        }
      }
      
      setRegistrationSuccess(true);
      toast({
        title: "¡Registro Exitoso!",
        description: `Bienvenido ${user.name}! Te hemos enviado un correo de confirmación.`,
      });

      // Don't navigate immediately - wait for email confirmation
    } catch (err) {
      toast({
        title: "Registro Fallido",
        description: error || "Por favor revise su información e intente de nuevo",
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
    <div className="min-h-screen bg-gradient-to-br from-nuevagen-blue to-nuevagen-teal py-6 px-4 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 p-5 bg-white rounded-xl shadow-lg">
        {registrationSuccess ? (
          <div className="flex flex-col items-center justify-center text-center">
            <img 
              src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
              alt="Nueva Generación Logo" 
              className="h-20 w-auto mb-4" 
            />
            <h2 className="text-2xl font-bold text-nuevagen-blue mb-4">
              ¡Registro Exitoso!
            </h2>
            <p className="text-gray-600 mb-6 text-sm">
              Te hemos enviado un correo de confirmación a <strong>{email}</strong>. 
              Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            <Link 
              to="/login" 
              className="w-full inline-block text-center px-4 py-2 bg-nuevagen-blue text-white font-medium rounded-lg hover:bg-opacity-90"
            >
              Ir al Inicio de Sesión
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center mb-4">
              <img 
                src="/lovable-uploads/3e471c72-20ba-448a-94e3-4531623f02bc.png" 
                alt="Nueva Generación Logo" 
                className="h-20 w-auto" 
              />
              <h2 className="mt-2 text-center text-2xl font-bold text-nuevagen-blue">
                Regístrate Ya
              </h2>
              <p className="text-center text-gray-600 text-sm mt-1">
                Únete a Nuestra Comunidad de Voluntarios
              </p>
            </div>

        <div className="mb-4 rounded-lg overflow-hidden gradient-toggle-container">
          <ToggleGroup
            type="single"
            value={accountType}
            onValueChange={(value) => {
              if (value && !isAdmin) {
                setAccountType(value as 'volunteer' | 'organization');
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
              value="volunteer"
              className={`flex-1 py-2 text-center transition-colors rounded-none ${
                accountType === 'volunteer' && !isAdmin
                  ? 'bg-nuevagen-blue/90 text-white font-bold' 
                  : 'bg-white/90 text-gray-600 hover:bg-white/70'
              } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Voluntario
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="organization"
              className={`flex-1 py-2 text-center transition-colors rounded-none ${
                accountType === 'organization' && !isAdmin
                  ? 'bg-nuevagen-blue/90 text-white font-bold' 
                  : 'bg-white/90 text-gray-600 hover:bg-white/70'
              } ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Organización
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mb-4 p-3 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield size={16} className={isAdmin ? "text-purple-600" : "text-gray-400"} />
              <Label htmlFor="admin-mode" className="font-medium text-sm">
                Cuenta Administrativa
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
                Clave de Administrador
              </Label>
              <Input
                id="admin-key"
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required={isAdmin}
                placeholder="Ingrese clave de administrador"
                className="text-sm h-8"
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Input
              type="email"
              placeholder="Correo Electrónico"
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
                placeholder="Contraseña"
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
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-10 text-sm"
              />
            </div>
          </div>

          {!isAdmin && accountType === 'volunteer' ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Input
                    type="text"
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={!isAdmin && accountType === 'volunteer'}
                    className="w-full h-10 text-sm"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={!isAdmin && accountType === 'volunteer'}
                    className="w-full h-10 text-sm"
                  />
                </div>
              </div>

              <div className="relative">
                <Input
                  type="text"
                  placeholder="dd/mm/yyyy"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="w-full h-10 text-sm"
                />
              </div>

              {/* Organization Membership Option */}
              <div className="mt-3 p-3 border border-gray-100 rounded-lg bg-blue-50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="join-org" className="font-medium text-sm">
                    Únete a una Organización
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
                      Selecciona tu Organización
                    </Label>
                    <Select 
                      value={selectedOrgId} 
                      onValueChange={setSelectedOrgId}
                    >
                      <SelectTrigger id="org-select" className="w-full h-9 text-sm">
                        <SelectValue placeholder="Seleccionar una organización" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeOrganizations.map(org => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Podrás participar en los eventos de tu organización
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : !isAdmin && accountType === 'organization' ? (
            <>
              <div>
                <Input
                  type="text"
                  placeholder="Nombre de la Organización"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required={!isAdmin && accountType === 'organization'}
                  className="w-full h-10 text-sm"
                />
              </div>
              <div>
                <Textarea
                  placeholder="Breve descripción de su organización (opcional)"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className="w-full text-sm resize-none"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <div>
              <Input
                type="text"
                placeholder="Nombre del Administrador"
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
              placeholder="Número de Teléfono"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 text-sm"
            />
          </div>

          {legalDocuments.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="legal-acceptance"
                  checked={legalAccepted}
                  onCheckedChange={(checked) => setLegalAccepted(!!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label
                    htmlFor="legal-acceptance"
                    className="text-sm text-gray-700 cursor-pointer leading-relaxed"
                  >
                    He leído y acepto los{' '}
                    <button
                      type="button"
                      onClick={() => openDocument('terms_and_privacy')}
                      className="text-nuevagen-blue hover:underline font-medium"
                    >
                      Términos, Condiciones y Privacidad
                    </button>
                    {' '}y el{' '}
                    <button
                      type="button"
                      onClick={() => openDocument('volunteering_rules')}
                      className="text-nuevagen-blue hover:underline font-medium"
                    >
                      Reglamento de Voluntariado
                    </button>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="remember-me-signup"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember-me-signup"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Mantener sesión iniciada
            </label>
          </div>

          <Button
            type="submit"
            disabled={isLoading || (joinOrg && !selectedOrgId) || !legalAccepted}
            className={`w-full h-10 ${isAdmin ? 'bg-purple-600 hover:bg-purple-700' : 'bg-nuevagen-blue hover:bg-opacity-90'} text-white font-medium rounded-lg text-sm`}
          >
            {isLoading ? "Creando Cuenta..." : "Registrarse"}
          </Button>

            <div className="text-center text-xs mt-3">
              <span className="text-gray-600">¿Ya Tienes una Cuenta? </span>
              <Link to="/login" className="font-medium text-nuevagen-blue hover:text-nuevagen-teal">
                Iniciar Sesión
              </Link>
            </div>
          </form>
          </>
        )}
      </Card>
    </div>
  );
};

export default Signup;
