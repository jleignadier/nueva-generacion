
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Copy, CalendarCheck, DollarSign, Camera } from 'lucide-react';
import QRScanner from '@/components/QRScanner';

const DonationsTab = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [donationMethod, setDonationMethod] = useState<'qrcode' | 'venmo'>('qrcode');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const { toast } = useToast();
  
  const yappyHandle = '@NuevaGeneracion';
  
  const presetAmounts = [10, 25, 50, 100];
  
  const handleCopyyappyHandle = () => {
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

  const handleQRScanSuccess = (result: string) => {
    // In a real app, this would be a donation URL
    // For now, we'll open a mock Venmo donation link
    const donationUrl = `https://venmo.com/u/NuevaGeneracion?txn=pay&amount=${amount || '10'}&note=Donation`;
    window.open(donationUrl, '_blank');
    setShowQRScanner(false);
    toast({
      title: "Abriendo enlace de donación",
      description: "Completa tu donación en la pestaña abierta",
    });
  };
  
  const handlePresetAmount = (value: string) => {
    setAmount(value);
  };
  
  const pointsEarned = useMemo(() => {
    const numAmount = Number(amount);
    return !isNaN(numAmount) ? numAmount : 0;
  }, [amount]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !receiptFile) {
      toast({
        title: "Información faltante",
        description: "Por favor proporciona la cantidad de donación y sube un recibo",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create donation object
    const newDonation = {
      id: `donation-${Date.now()}`,
      amount: amount,
      note: note,
      receiptFile: receiptFile.name, // In a real app, we'd upload this file to storage
      date: new Date().toLocaleDateString(),
      name: "Current User", // In a real app, get this from user profile
      status: "Pending"
    };
    
    // Save to localStorage
    const submittedDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    submittedDonations.push(newDonation);
    localStorage.setItem('submittedDonations', JSON.stringify(submittedDonations));
    
    // Show success toast
    setTimeout(() => {
      toast({
        title: "¡Donación enviada!",
        description: `Tu donación de $${amount} ha sido enviada para verificación.`,
      });
      
      // Reset form
      setAmount('');
      setNote('');
      setReceiptFile(null);
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="app-container">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Donaciones</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Hacer una Donación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => setDonationMethod('qrcode')}
                className={`flex-1 py-2 text-center transition-colors ${
                  donationMethod === 'qrcode' 
                    ? 'bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal text-white font-medium rounded-l-lg' 
                    : 'bg-gray-100 text-gray-600 rounded-l-lg'
                }`}
              >
                <QrCode className="mx-auto mb-1" size={18} />
                Escanear Código QR
              </button>
              <button
                type="button"
                onClick={() => setDonationMethod('venmo')}
                className={`flex-1 py-2 text-center transition-colors ${
                  donationMethod === 'venmo' 
                    ? 'bg-gradient-to-r from-nuevagen-blue to-nuevagen-teal text-white font-medium rounded-r-lg' 
                    : 'bg-gray-100 text-gray-600 rounded-r-lg'
                }`}
              >
                Usuario de Yappy
              </button>
            </div>
            
            {donationMethod === 'qrcode' ? (
              <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <Button 
                    onClick={() => setShowQRScanner(true)}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <QrCode size={20} />
                    Escanear Código QR de Donación
                  </Button>
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Usa tu cámara para escanear un código QR de donación
                </p>
              </div>
            ) : (
              <div className="flex flex-col p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="font-medium text-gray-800">{yappyHandle}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopyyappyHandle}
                    className="flex gap-1 items-center" 
                  >
                    <Copy size={16} />
                    Copiar
                  </Button>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Envía tu donación a este usuario de Venmo
                </p>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount" className="mb-2 block">Cantidad de Donación ($)</Label>
              
              <div className="grid grid-cols-4 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <Button 
                    key={preset}
                    type="button"
                    variant={amount === preset.toString() ? "default" : "outline"}
                    onClick={() => handlePresetAmount(preset.toString())}
                    className="w-full"
                  >
                    ${preset}
                  </Button>
                ))}
              </div>
              
              <div className="flex items-center">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Cantidad personalizada"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm font-medium text-nuevagen-blue flex items-center">
                <CalendarCheck className="mr-1" size={16} />
                Ganarás {pointsEarned} puntos con esta donación
              </div>
            </div>
            
            <div>
              <Label htmlFor="receiptUpload">Subir Recibo</Label>
              <div className="mt-1 flex items-center">
                <Input
                  id="receiptUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por favor sube una captura de pantalla de tu recibo de donación
              </p>
            </div>
            
            <div>
              <Label htmlFor="note" className="block">Nota (Opcional)</Label>
              <Textarea
                id="note"
                placeholder="Agrega una nota sobre tu donación"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-6"
              >
                {isSubmitting ? "Enviando..." : "Enviar Donación para Verificación"}
              </Button>
              <p className="text-center text-sm mt-3 text-gray-600">
                <CalendarCheck className="inline-block mr-1" size={16} />
                Gana 1 punto por cada dólar donado
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Escanear Código QR de Donación</DialogTitle>
          </DialogHeader>
          <QRScanner 
            onSuccess={handleQRScanSuccess}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DonationsTab;
