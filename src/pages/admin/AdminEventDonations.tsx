import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Check, X, DollarSign, Calendar, User, Building2 } from 'lucide-react';
import { useEventsStore } from '@/store/eventsStore';

const AdminEventDonations = () => {
  const { events, approveDonation, rejectDonation } = useEventsStore();
  const { toast } = useToast();

  // Get all events with donations
  const eventsWithDonations = events.filter(event => 
    event.donations && event.donations.length > 0
  );

  const handleApproveDonation = (eventId: string, donationId: string, donorName: string, amount: number) => {
    approveDonation(eventId, donationId);
    toast({
      title: "Donación aprobada",
      description: `Donación de $${amount} de ${donorName} ha sido aprobada.`,
    });
  };

  const handleRejectDonation = (eventId: string, donationId: string, donorName: string, amount: number) => {
    rejectDonation(eventId, donationId);
    toast({
      title: "Donación rechazada",
      description: `Donación de $${amount} de ${donorName} ha sido rechazada.`,
      variant: "destructive"
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (eventsWithDonations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Donaciones de Eventos</h1>
        <Card className="bg-zinc-800 border border-zinc-700">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <DollarSign size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-400 mb-2">No hay donaciones para eventos</p>
              <p className="text-sm text-gray-500">Las donaciones aparecerán aquí cuando los usuarios contribuyan a eventos.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Donaciones de Eventos</h1>
      
      <div className="space-y-4">
        {eventsWithDonations.map(event => (
          <Card key={event.id} className="bg-zinc-800 border border-zinc-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {formatDate(event.date)}
                    </span>
                    {event.fundingRequired && (
                      <span className="flex items-center gap-1">
                        <DollarSign size={14} />
                        ${event.currentFunding || 0} / ${event.fundingRequired}
                      </span>
                    )}
                  </div>
                </div>
                {event.fundingRequired && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-400">
                      {Math.round(((event.currentFunding || 0) / event.fundingRequired) * 100)}%
                    </div>
                    <div className="text-xs text-gray-400">financiado</div>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {event.donations?.map(donation => (
                  <div key={donation.id} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{donation.userName}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>${donation.amount}</span>
                          <span>•</span>
                          <span>{formatDate(donation.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(donation.status)}>
                        {donation.status === 'pending' && 'Pendiente'}
                        {donation.status === 'approved' && 'Aprobada'}
                        {donation.status === 'rejected' && 'Rechazada'}
                      </Badge>
                      
                      {donation.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveDonation(event.id, donation.id, donation.userName, donation.amount)}
                            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                          >
                            <Check size={14} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectDonation(event.id, donation.id, donation.userName, donation.amount)}
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminEventDonations;