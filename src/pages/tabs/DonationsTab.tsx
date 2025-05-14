
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { QrCode, Copy, CalendarCheck } from 'lucide-react';

const DonationsTab = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [donationMethod, setDonationMethod] = useState<'qrcode' | 'venmo'>('qrcode');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const venmoHandle = '@NuevaGeneracion';
  
  const handleCopyVenmoHandle = () => {
    navigator.clipboard.writeText(venmoHandle);
    toast({
      title: "Copied!",
      description: "Venmo handle copied to clipboard",
    });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setReceiptFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !receiptFile) {
      toast({
        title: "Missing information",
        description: "Please provide the donation amount and upload a receipt",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Donation submitted!",
        description: `Your donation of $${amount} has been submitted for verification.`,
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
        <h1 className="text-2xl font-bold text-gray-800">Donations</h1>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Make a Donation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="flex mb-4">
              <button
                type="button"
                onClick={() => setDonationMethod('qrcode')}
                className={`flex-1 py-2 text-center transition-colors ${
                  donationMethod === 'qrcode' 
                    ? 'bg-nuevagen-blue text-white font-medium rounded-l-lg' 
                    : 'bg-gray-100 text-gray-600 rounded-l-lg'
                }`}
              >
                <QrCode className="mx-auto mb-1" size={18} />
                Scan QR Code
              </button>
              <button
                type="button"
                onClick={() => setDonationMethod('venmo')}
                className={`flex-1 py-2 text-center transition-colors ${
                  donationMethod === 'venmo' 
                    ? 'bg-nuevagen-blue text-white font-medium rounded-r-lg' 
                    : 'bg-gray-100 text-gray-600 rounded-r-lg'
                }`}
              >
                Venmo Handle
              </button>
            </div>
            
            {donationMethod === 'qrcode' ? (
              <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <img 
                    src="https://placehold.co/200x200/png?text=QR+Code" 
                    alt="Donation QR Code" 
                    className="w-48 h-48" 
                  />
                </div>
                <p className="mt-4 text-sm text-gray-600">
                  Scan this QR code to donate through Venmo
                </p>
              </div>
            ) : (
              <div className="flex flex-col p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                  <span className="font-medium text-gray-800">{venmoHandle}</span>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleCopyVenmoHandle}
                    className="flex gap-1 items-center" 
                  >
                    <Copy size={16} />
                    Copy
                  </Button>
                </div>
                <p className="mt-3 text-sm text-gray-600">
                  Send your donation to this Venmo handle
                </p>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Donation Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                step="1"
                placeholder="Enter donation amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="receiptUpload">Upload Receipt</Label>
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
                Please upload a screenshot of your donation receipt
              </p>
            </div>
            
            <div>
              <Label htmlFor="note" className="block">Note (Optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note about your donation"
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
                {isSubmitting ? "Submitting..." : "Submit Donation for Verification"}
              </Button>
              <p className="text-center text-sm mt-3 text-gray-600">
                <CalendarCheck className="inline-block mr-1" size={16} />
                Earn 1 point for every dollar donated
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonationsTab;
