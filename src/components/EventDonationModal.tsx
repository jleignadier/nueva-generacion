import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Heart, Target, Copy, Building2 } from 'lucide-react';
import { useEventsStore } from '@/store/eventsStore';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganizationsStore } from '@/store/organizationsStore';
import { supabase } from '@/integrations/supabase/client';
import { uploadFile, validateFileType } from '@/utils/fileUpload';

interface EventDonationModalProps {
  eventId: string;
  eventTitle: string;
  fundingRequired: number;
  currentFunding: number;
  pointsEarned: number;
  isOpen: boolean;
  onClose: () => void;
}

const EventDonationModal: React.FC<EventDonationModalProps> = ({
  eventId,
  eventTitle,
  fundingRequired,
  currentFunding,
  pointsEarned,
  isOpen,
  onClose
}) => {
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donationMethod] = useState<'yappy'>('yappy');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [donationType, setDonationType] = useState<'individual' | 'organization'>('individual');
  const { addDonation } = useEventsStore();
  const { user } = useAuth();
  const { organizations } = useOrganizationsStore();
  const { toast } = useToast();

  const yappyHandle = '@NuevaGeneracion';
  const userOrganization = user?.organizationId ? organizations.find(org => org.id === user.organizationId) : null;

  const fundingProgress = (currentFunding / fundingRequired) * 100;
  const remainingAmount = Math.max(0, fundingRequired - currentFunding);
  const calculatedPoints = parseFloat(donationAmount) || 0;

  const handleCopyYappyHandle = () => {
    navigator.clipboard.writeText(yappyHandle);
    toast({
      title: "¡Copiado!",
      description: "Usuario de Yappy copiado al portapapeles",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(donationAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Monto inválido",
        description: "Por favor ingresa un monto válido",
        variant: "destructive"
      });
      return;
    }

    if (!receiptFile) {
      toast({
        title: "Recibo requerido",
        description: "Por favor sube un recibo de tu donación",
        variant: "destructive"
      });
      return;
    }

    // Validate file type
    if (!validateFileType(receiptFile, ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'])) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Solo se permiten imágenes (JPG, PNG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para hacer una donación",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload receipt to Supabase storage
      const { url: receiptUrl, path: receiptPath } = await uploadFile(
        'donation-receipts',
        receiptFile
      );

      // Insert donation into database
      const { error } = await supabase
        .from('donations')
        .insert({
          user_id: user.id,
          event_id: eventId,
          amount: amount,
          receipt_url: receiptUrl,
          receipt_path: receiptPath,
          donation_method: donationMethod,
          donation_type: donationType,
          organization_id: donationType === 'organization' ? user.organizationId : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "¡Donación enviada!",
        description: `Tu donación de $${amount} ha sido enviada y está pendiente de aprobación. Ganarás ${calculatedPoints} puntos cuando sea aprobada.`,
      });

      // Reset form and close modal
      setDonationAmount('');
      setReceiptFile(null);
      setDonationType('individual');
      onClose();
    } catch (error: any) {
      console.error('Error submitting donation:', error);
      toast({
        title: "Error al enviar donación",
        description: error.message || "Por favor intenta de nuevo",
        variant: "destructive"
      });
    }
  };

  const quickAmounts = [25, 50, 100, 200];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="text-red-500" size={20} />
            Financiar Evento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{eventTitle}</h3>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-3">
              <Target size={16} />
              <span>Meta: ${fundingRequired}</span>
              <span>•</span>
              <span>{pointsEarned} puntos por participar</span>
            </div>
            <Progress value={fundingProgress} className="mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">${currentFunding} recaudado</span>
              <span className="text-orange-600">${remainingAmount} restante</span>
            </div>
          </div>

          {/* Yappy Handle */}
          <div className="space-y-3">
            <Label>Método de Donación - Yappy</Label>
            <div className="flex items-center justify-between bg-muted p-3 rounded">
              <span className="font-medium">{yappyHandle}</span>
              <Button 
                type="button"
                variant="ghost" 
                size="sm"
                onClick={handleCopyYappyHandle}
                className="flex gap-1 items-center" 
              >
                <Copy size={16} />
                Copiar
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Donation Type Selection */}
            {user && userOrganization && (
              <div className="space-y-2">
                <Label>Donar como</Label>
                <Select value={donationType} onValueChange={(value: 'individual' | 'organization') => setDonationType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual ({user.name})</SelectItem>
                    <SelectItem value="organization">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} />
                        {userOrganization.name}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Monto de donación</Label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
              <div className="text-sm text-green-600 font-medium">
                Ganarás {calculatedPoints} puntos con esta donación
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDonationAmount(amount.toString())}
                  className="text-xs"
                >
                  ${amount}
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiptUpload">Subir Recibo *</Label>
              <Input
                id="receiptUpload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Sube una captura de pantalla de tu recibo de donación
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
              <p>Tu donación será revisada por los administradores antes de ser aprobada y añadida al total del evento.</p>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Donar ${donationAmount || '0'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDonationModal;