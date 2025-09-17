
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Eye, Calendar, Building2, User, DollarSign, ArrowUpDown } from "lucide-react";
import { useEventsStore } from '@/store/eventsStore';
import { formatDate } from '@/utils/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Donation {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'Pendiente' | 'Verificada' | 'Rechazada' | 'Completada' | 'Pending' | 'Verified' | 'Rejected' | 'Completed';
  receipt?: string;
  note?: string;
  eventId?: string;
  eventTitle?: string;
  donationType?: 'individual' | 'organization';
  donationMethod?: 'qrcode' | 'yappy';
}

const AdminDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const { toast } = useToast();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const { events, approveDonation, rejectDonation } = useEventsStore();

  useEffect(() => {
    loadAllDonations();
  }, [events]); // Re-load when events change

  // Filter and sort donations based on search term and sorting
  React.useEffect(() => {
    let filtered = donations;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = donations.filter(donation => {
        const donationType = donation.eventId ? 'evento' : 'general';
        const eventTitle = donation.eventTitle?.toLowerCase() || '';
        
        return (
          donation.name.toLowerCase().includes(searchLower) ||
          donation.amount.toLowerCase().includes(searchLower) ||
          donation.date.toLowerCase().includes(searchLower) ||
          donation.status.toLowerCase().includes(searchLower) ||
          donationType.includes(searchLower) ||
          eventTitle.includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return parseDateForSorting(b.date) - parseDateForSorting(a.date);
        case 'date-asc':
          return parseDateForSorting(a.date) - parseDateForSorting(b.date);
        case 'amount-desc':
          return parseAmountForSorting(b.amount) - parseAmountForSorting(a.amount);
        case 'amount-asc':
          return parseAmountForSorting(a.amount) - parseAmountForSorting(b.amount);
        default:
          return 0;
      }
    });

    setFilteredDonations(sorted);
  }, [searchTerm, donations, sortBy]);
  
  // Helper functions for sorting
  const parseDateForSorting = (dateStr: string): number => {
    // Handle different date formats
    if (dateStr.includes('/')) {
      // dd/mm/yyyy format
      const [day, month, year] = dateStr.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
    } else if (dateStr.includes(' de ')) {
      // Spanish format like "12 de mayo, 2023"
      return new Date(dateStr).getTime() || 0;
    } else {
      // ISO or other formats
      return new Date(dateStr).getTime() || 0;
    }
  };
  
  const parseAmountForSorting = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
  };

  const loadAllDonations = () => {
    // Load mock donations and any user-submitted donations from localStorage
    const userSubmittedDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    
    // Transform user submissions to the correct format
    const formattedUserDonations = userSubmittedDonations.map((donation: any) => ({
      id: donation.id || `user-${Math.random().toString(36).substr(2, 9)}`,
      name: donation.name || 'User Donation',
      amount: `$${donation.amount}`,
      date: donation.date || formatDate(new Date().toISOString().split('T')[0]),
      status: donation.status || 'Pendiente',
      receipt: donation.receiptFile,
      note: donation.note
    }));

    // Get mock donations from localStorage or use default if not present
    const savedMockDonations = JSON.parse(localStorage.getItem('mockDonations') || 'null');
    
    const mockDonations = savedMockDonations || [
      { id: '1', name: 'John Doe', amount: '$1,000', date: formatDate('2023-05-12'), status: 'Completada' },
      { id: '2', name: 'Maria Garcia', amount: '$500', date: formatDate('2023-05-10'), status: 'Completada' },
      { id: '3', name: 'Robert Smith', amount: '$750', date: formatDate('2023-05-08'), status: 'Pendiente' },
    ];

    // If mock donations were not in localStorage yet, save them
    if (!savedMockDonations) {
      localStorage.setItem('mockDonations', JSON.stringify(mockDonations));
    }

    // Get event donations
    const eventDonations: Donation[] = [];
    events.forEach(event => {
      if (event.donations) {
        event.donations.forEach(donation => {
          eventDonations.push({
            id: `event-${event.id}-${donation.id}`,
            name: donation.userName,
            amount: `$${donation.amount}`,
            date: formatDate(donation.createdAt),
            status: donation.status === 'approved' ? 'Completada' : donation.status === 'rejected' ? 'Rechazada' : 'Pendiente',
            receipt: donation.receiptFile,
            eventId: event.id,
            eventTitle: event.title,
            donationType: donation.donationType,
            donationMethod: donation.donationMethod
          });
        });
      }
    });

    // Combine all donations
    const allDonations = [...formattedUserDonations, ...mockDonations, ...eventDonations];

    setDonations(allDonations);
    setFilteredDonations(allDonations);
  };

  const handleStatusUpdate = (donationId: string, newStatus: 'Completada' | 'Rechazada') => {
    // Check if this is an event donation
    if (donationId.startsWith('event-')) {
      const [, eventId, originalDonationId] = donationId.split('-');
      
      if (newStatus === 'Completada') {
        approveDonation(eventId, originalDonationId);
      } else {
        rejectDonation(eventId, originalDonationId);
      }
      
      // Reload donations to reflect changes
      setTimeout(() => loadAllDonations(), 100);
      
      toast({
        title: "Donación de evento actualizada",
        description: `El estado de la donación ha sido actualizado a ${newStatus}`
      });
      
      if (showDetailsModal) {
        setShowDetailsModal(false);
        setSelectedDonation(null);
      }
      return;
    }
    
    // Handle regular donations (existing logic)
    const updatedDonations = donations.map(donation => 
      donation.id === donationId 
        ? { ...donation, status: newStatus } 
        : donation
    );
    setDonations(updatedDonations);
    
    // Update filtered donations as well
    setFilteredDonations(prev => 
      prev.map(donation => 
        donation.id === donationId 
          ? { ...donation, status: newStatus } 
          : donation
      )
    );

    // Find the donation that was updated
    const updatedDonation = donations.find(d => d.id === donationId);
    
    // Check if it's a mock donation
    const isMockDonation = ['1', '2', '3'].includes(donationId);
    
    if (isMockDonation) {
      // Update in mock donations storage
      const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
      const updatedMockDonations = mockDonations.map((donation: any) => 
        donation.id === donationId ? { ...donation, status: newStatus } : donation
      );
      localStorage.setItem('mockDonations', JSON.stringify(updatedMockDonations));
    } else {
      // Update in user donations storage
      const userDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
      const updatedDonations = userDonations.map((donation: any) => 
        donation.id === donationId ? { ...donation, status: newStatus } : donation
      );
      localStorage.setItem('submittedDonations', JSON.stringify(updatedDonations));
    }

    toast({
      title: "Donación actualizada",
      description: `El estado de la donación ha sido actualizado a ${newStatus}`
    });
    
    // Close the modal after updating status
    if (showDetailsModal) {
      setShowDetailsModal(false);
      setSelectedDonation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completada':
      case 'Completed':
        return <Badge className="bg-green-600 hover:bg-green-700">Completada</Badge>;
      case 'Verificada':
      case 'Verified':
        return <Badge className="bg-green-600 hover:bg-green-700">Completada</Badge>;
      case 'Rechazada':
      case 'Rejected':
        return <Badge className="bg-red-600 hover:bg-red-700">Rechazada</Badge>;
      case 'Pendiente':
      case 'Pending':
      default:
        return <Badge className="bg-amber-600 hover:bg-amber-700">Pendiente</Badge>;
    }
  };

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Administración de Donaciones</h1>
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg min-h-[600px]">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl font-medium text-white">Todas las Donaciones</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[200px] bg-zinc-700 border-zinc-600 text-white">
                  <SelectValue placeholder="Ordenar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Más recientes</SelectItem>
                  <SelectItem value="date-asc">Más antiguos</SelectItem>
                  <SelectItem value="amount-desc">Monto mayor</SelectItem>
                  <SelectItem value="amount-asc">Monto menor</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="text"
                placeholder="Buscar por donante, tipo, evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-zinc-400 sm:w-80"
              />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-700">
                <TableHead className="text-white">Tipo</TableHead>
                <TableHead className="text-white">Donante</TableHead>
                <TableHead className="text-white">Monto</TableHead>
                <TableHead className="text-white">Fecha</TableHead>
                <TableHead className="text-white">Estado</TableHead>
                <TableHead className="text-white">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.map((donation) => (
                <TableRow key={donation.id} className="border-b border-zinc-700">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {donation.eventId ? (
                        <Calendar size={16} className="text-blue-400" />
                      ) : (
                        <DollarSign size={16} className="text-green-400" />
                      )}
                      <div className="text-xs">
                        {donation.eventId ? (
                          <div>
                            <div className="text-blue-400 font-medium">Evento</div>
                            <div className="text-zinc-400">{donation.eventTitle}</div>
                          </div>
                        ) : (
                          <div className="text-green-400 font-medium">General</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {donation.donationType === 'organization' ? (
                        <Building2 size={14} className="text-purple-400" />
                      ) : (
                        <User size={14} className="text-gray-400" />
                      )}
                      <span>{donation.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{donation.amount}</TableCell>
                  <TableCell className="text-zinc-400">{donation.date}</TableCell>
                  <TableCell>
                    {getStatusBadge(donation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-black hover:text-black bg-white hover:bg-gray-100 border-gray-300"
                        onClick={() => handleViewDetails(donation)}
                      >
                        <Eye className="mr-1 h-4 w-4" /> 
                        Detalles
                      </Button>
                      
                      {(donation.status === 'Pendiente' || donation.status === 'Pending') && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 hover:border-green-400"
                            onClick={() => handleStatusUpdate(donation.id, 'Completada')}
                          >
                            Verificar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:border-red-400"
                            onClick={() => handleStatusUpdate(donation.id, 'Rechazada')}
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredDonations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-zinc-400">
                    {searchTerm ? 'No se encontraron donaciones que coincidan con tu búsqueda' : 'No se encontraron donaciones'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles de la Donación</DialogTitle>
          </DialogHeader>
          
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Donante</p>
                  <p>{selectedDonation.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Monto</p>
                  <p>{selectedDonation.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Fecha</p>
                  <p>{selectedDonation.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p>{selectedDonation.status}</p>
                </div>
              </div>
              
              {selectedDonation.eventId && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Evento</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar size={16} className="text-blue-400" />
                    <p className="text-blue-600">{selectedDonation.eventTitle}</p>
                  </div>
                </div>
              )}
              
              {selectedDonation.donationType && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Tipo de Donación</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedDonation.donationType === 'organization' ? (
                      <>
                        <Building2 size={16} className="text-purple-400" />
                        <p>Organización</p>
                      </>
                    ) : (
                      <>
                        <User size={16} className="text-gray-400" />
                        <p>Individual</p>
                      </>
                    )}
                  </div>
                </div>
              )}
              
              {selectedDonation.donationMethod && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Método de Pago</p>
                  <p className="capitalize">{selectedDonation.donationMethod === 'yappy' ? 'Yappy' : 'Código QR'}</p>
                </div>
              )}
              
              {selectedDonation.note && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Nota</p>
                  <p className="text-sm mt-1 p-2 bg-gray-100 text-black rounded">{selectedDonation.note}</p>
                </div>
              )}
              
              {selectedDonation.receipt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Recibo</p>
                  <div className="border rounded-lg overflow-hidden mt-1">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={selectedDonation.receipt} 
                        alt="Recibo de Donación"
                        className="object-contain w-full h-full"
                      />
                    </AspectRatio>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsModal(false)}
            >
              Cerrar
            </Button>
            
            {selectedDonation && (selectedDonation.status === 'Pendiente' || selectedDonation.status === 'Pending') && (
              <div className="flex space-x-2">
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'Completada')}
                >
                  Verificar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'Rechazada')}
                >
                  Rechazar
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDonations;
