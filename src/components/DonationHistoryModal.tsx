import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, CircleDollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DonationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Donation {
  id: string;
  amount: number;
  date: string;
  note: string;
  status: 'pending' | 'verified' | 'rejected';
}

const DonationHistoryModal: React.FC<DonationHistoryModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');

  // Get donations from localStorage
  const donations: Donation[] = useMemo(() => {
    const submittedDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    return submittedDonations;
  }, []);

  // Calculate stats
  const stats = useMemo(() => {
    const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyTotal = donations
      .filter(d => {
        const donationDate = new Date(d.date);
        return donationDate.getMonth() === thisMonth && donationDate.getFullYear() === thisYear;
      })
      .reduce((sum, d) => sum + Number(d.amount), 0);

    return { total, thisMonth: monthlyTotal };
  }, [donations]);

  // Filter donations based on active tab
  const filteredDonations = useMemo(() => {
    if (activeTab === 'all') return donations;
    return donations.filter(d => d.status === activeTab);
  }, [donations, activeTab]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verificado';
      case 'rejected':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gift size={20} className="mr-2 text-primary" />
            Historial de Donaciones
          </DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <CircleDollarSign size={16} className="text-primary mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-semibold">${stats.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <Gift size={16} className="text-secondary mr-2" />
                <div>
                  <p className="text-xs text-muted-foreground">Este Mes</p>
                  <p className="font-semibold">${stats.thisMonth.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">Pendientes</TabsTrigger>
            <TabsTrigger value="verified" className="text-xs">Verificadas</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs">Rechazadas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            <div className="space-y-3">
              {filteredDonations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No hay donaciones en esta categoría</p>
                </div>
              ) : (
                filteredDonations.map((donation) => (
                  <Card key={donation.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">${Number(donation.amount).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(donation.date).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {getStatusIcon(donation.status)}
                          <span className="ml-1 text-sm">{getStatusText(donation.status)}</span>
                        </div>
                      </div>
                      {donation.note && (
                        <p className="text-sm text-muted-foreground">{donation.note}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <Button onClick={onClose} className="w-full mt-4">
          Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DonationHistoryModal;