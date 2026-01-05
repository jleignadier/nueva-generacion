
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Eye, Calendar, Building2, User, DollarSign, ArrowUpDown } from "lucide-react";
import { useEventsStore } from '@/store/eventsStore';
import { formatDateTime } from '@/utils/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
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
  status: 'pending' | 'approved' | 'rejected';
  receipt_url?: string;
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
  const { events, approveDonation, rejectDonation, loadEvents } = useEventsStore();

  useEffect(() => {
    loadAllDonations();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('donations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donations'
        },
        () => {
          loadAllDonations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const loadAllDonations = async () => {
    try {
      // Fetch donations from database
      const { data: dbDonations, error } = await supabase
        .from('donations')
        .select(`
          *,
          profiles!donations_user_id_fkey(first_name, last_name),
          events(title),
          organizations(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database donations to the format expected by the UI
      const formattedDonations: Donation[] = (dbDonations || []).map((donation: any) => ({
        id: donation.id,
        name: `${donation.profiles?.first_name || ''} ${donation.profiles?.last_name || ''}`.trim() || 'Usuario Desconocido',
        amount: `$${donation.amount}`,
        date: formatDateTime(donation.created_at),
        status: donation.status,
        receipt_url: donation.receipt_url,
        note: donation.note,
        eventId: donation.event_id,
        eventTitle: donation.events?.title,
        donationType: donation.donation_type,
        donationMethod: donation.donation_method
      }));

      setDonations(formattedDonations);
      setFilteredDonations(formattedDonations);
    } catch (error) {
      console.error('Error loading donations:', error);
      toast({
        title: "Error al cargar donaciones",
        description: "No se pudieron cargar las donaciones",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (donationId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const donation = donations.find(d => d.id === donationId);
      if (!donation) return;

      // Update donation status in database
      const { error } = await supabase
        .from('donations')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', donationId);

      if (error) throw error;

      // If approved and there's an event, update event funding
      if (newStatus === 'approved' && donation.eventId) {
        const amount = parseFloat(donation.amount.replace(/[$,]/g, ''));
        console.log(`Approving donation of $${amount} for event ${donation.eventId}`);
        
        // Get current event funding
        const { data: eventData, error: fetchError } = await supabase
          .from('events')
          .select('current_funding, title')
          .eq('id', donation.eventId)
          .single();

        if (fetchError) {
          console.error('Error fetching event data:', fetchError);
          toast({
            title: "Warning",
            description: "Donation approved but event funding couldn't be updated",
            variant: "destructive",
          });
        } else if (eventData) {
          const newFunding = (eventData.current_funding || 0) + amount;
          console.log(`Updating event "${eventData.title}" funding from $${eventData.current_funding} to $${newFunding}`);
          
          // Update the event's current funding
          const { error: eventError } = await supabase
            .from('events')
            .update({
              current_funding: newFunding
            })
            .eq('id', donation.eventId);

          if (eventError) {
            console.error('Error updating event funding:', eventError);
            toast({
              title: "Warning",
              description: "Donation approved but event funding couldn't be updated",
              variant: "destructive",
            });
          } else {
            console.log(`✅ Successfully updated event funding to $${newFunding}`);
            // Reload events to reflect the updated funding
            await loadEvents();
            toast({
              title: "Event Funding Updated",
              description: `Added $${amount} to event funding`,
            });
          }
        }
      }

      toast({
        title: "Donación actualizada",
        description: `La donación ha sido ${newStatus === 'approved' ? 'aprobada' : 'rechazada'}`
      });

      // Reload donations
      await loadAllDonations();
      
      // Close the modal
      if (showDetailsModal) {
        setShowDetailsModal(false);
        setSelectedDonation(null);
      }
    } catch (error: any) {
      console.error('Error updating donation:', error);
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar la donación",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Aprobada</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700">Rechazada</Badge>;
      case 'pending':
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
                      
                      {donation.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 hover:border-green-400"
                            onClick={() => handleStatusUpdate(donation.id, 'approved')}
                          >
                            Aprobar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:border-red-400"
                            onClick={() => handleStatusUpdate(donation.id, 'rejected')}
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
              
              {selectedDonation.receipt_url && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Recibo</p>
                  <div className="border rounded-lg overflow-hidden mt-1">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={selectedDonation.receipt_url} 
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
            
            {selectedDonation && selectedDonation.status === 'pending' && (
              <div className="flex space-x-2">
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'approved')}
                >
                  Aprobar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'rejected')}
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
