import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { DollarSign, Heart, Target } from 'lucide-react';
import { useEventsStore } from '@/store/eventsStore';

interface EventDonationModalProps {
  eventId: string;
  eventTitle: string;
  fundingRequired: number;
  currentFunding: number;
  isOpen: boolean;
  onClose: () => void;
}

const EventDonationModal: React.FC<EventDonationModalProps> = ({
  eventId,
  eventTitle,
  fundingRequired,
  currentFunding,
  isOpen,
  onClose
}) => {
  const [donationAmount, setDonationAmount] = useState<string>('');
  const [donorName, setDonorName] = useState<string>('');
  const { addDonation } = useEventsStore();
  const { toast } = useToast();

  const fundingProgress = (currentFunding / fundingRequired) * 100;
  const remainingAmount = Math.max(0, fundingRequired - currentFunding);

  const handleSubmit = (e: React.FormEvent) => {
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

    if (!donorName.trim()) {
      toast({
        title: "Información faltante",
        description: "Por favor ingresa tu nombre",
        variant: "destructive"
      });
      return;
    }

    // Add donation (pending approval)
    addDonation(eventId, {
      userId: Date.now().toString(), // In real app, this would be the actual user ID
      userName: donorName.trim(),
      amount,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    });

    toast({
      title: "¡Donación enviada!",
      description: `Tu donación de $${amount} ha sido enviada y está pendiente de aprobación.`,
    });

    // Reset form and close modal
    setDonationAmount('');
    setDonorName('');
    onClose();
  };

  const quickAmounts = [25, 50, 100, 200];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
            </div>
            <Progress value={fundingProgress} className="mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">${currentFunding} recaudado</span>
              <span className="text-orange-600">${remainingAmount} restante</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Tu nombre</Label>
              <Input
                id="donorName"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Ingresa tu nombre"
                required
              />
            </div>

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