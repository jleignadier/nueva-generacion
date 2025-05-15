
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { Eye } from "lucide-react";
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
  status: 'Pending' | 'Verified' | 'Rejected' | 'Completed';
  receipt?: string;
  note?: string;
}

const AdminDonations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const { toast } = useToast();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);

  useEffect(() => {
    loadAllDonations();
  }, []);

  const loadAllDonations = () => {
    // Load mock donations and any user-submitted donations from localStorage
    const userSubmittedDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    
    // Transform user submissions to the correct format
    const formattedUserDonations = userSubmittedDonations.map((donation: any) => ({
      id: donation.id || `user-${Math.random().toString(36).substr(2, 9)}`,
      name: donation.name || 'User Donation',
      amount: `$${donation.amount}`,
      date: donation.date || new Date().toLocaleDateString(),
      status: donation.status || 'Pending',
      receipt: donation.receiptFile,
      note: donation.note
    }));

    // Get mock donations from localStorage or use default if not present
    const savedMockDonations = JSON.parse(localStorage.getItem('mockDonations') || 'null');
    
    const mockDonations = savedMockDonations || [
      { id: '1', name: 'John Doe', amount: '$1,000', date: 'May 12, 2023', status: 'Completed' },
      { id: '2', name: 'Maria Garcia', amount: '$500', date: 'May 10, 2023', status: 'Completed' },
      { id: '3', name: 'Robert Smith', amount: '$750', date: 'May 8, 2023', status: 'Pending' },
    ];

    // If mock donations were not in localStorage yet, save them
    if (!savedMockDonations) {
      localStorage.setItem('mockDonations', JSON.stringify(mockDonations));
    }

    // Combine and sort by date (most recent first)
    const allDonations = [...formattedUserDonations, ...mockDonations];
    
    // Parse dates for sorting
    const sortedDonations = allDonations.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Sort by most recent first
    });

    setDonations(sortedDonations);
  };

  const handleStatusUpdate = (donationId: string, newStatus: 'Completed' | 'Rejected') => {
    // Update in state
    setDonations(prev => 
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
      title: "Donation updated",
      description: `Donation status has been updated to ${newStatus}`
    });
    
    // Close the modal after updating status
    if (showDetailsModal) {
      setShowDetailsModal(false);
      setSelectedDonation(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Completed':
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case 'Verified':
        return <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>;
      case 'Pending':
      default:
        return <Badge className="bg-amber-600 hover:bg-amber-700">Pending</Badge>;
    }
  };

  const handleViewDetails = (donation: Donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Donations Management</h1>
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <h2 className="text-xl font-medium mb-6">All Donations</h2>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-700">
                <TableHead className="text-white">Donor</TableHead>
                <TableHead className="text-white">Amount</TableHead>
                <TableHead className="text-white">Date</TableHead>
                <TableHead className="text-white">Status</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {donations.map((donation) => (
                <TableRow key={donation.id} className="border-b border-zinc-700">
                  <TableCell>{donation.name}</TableCell>
                  <TableCell className="font-medium">{donation.amount}</TableCell>
                  <TableCell className="text-zinc-400">{donation.date}</TableCell>
                  <TableCell>
                    {getStatusBadge(donation.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-black hover:text-black bg-white hover:bg-gray-100 border-gray-300"
                        onClick={() => handleViewDetails(donation)}
                      >
                        <Eye className="mr-1 h-4 w-4" /> 
                        Details
                      </Button>
                      
                      {donation.status === 'Pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-green-400 hover:text-green-300 hover:border-green-400"
                            onClick={() => handleStatusUpdate(donation.id, 'Completed')}
                          >
                            Verify
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:border-red-400"
                            onClick={() => handleStatusUpdate(donation.id, 'Rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {donations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-zinc-400">
                    No donations found
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
            <DialogTitle>Donation Details</DialogTitle>
          </DialogHeader>
          
          {selectedDonation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Donor</p>
                  <p>{selectedDonation.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Amount</p>
                  <p>{selectedDonation.amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p>{selectedDonation.date}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p>{selectedDonation.status}</p>
                </div>
              </div>
              
              {selectedDonation.note && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Note</p>
                  <p className="text-sm mt-1 p-2 bg-gray-100 text-black rounded">{selectedDonation.note}</p>
                </div>
              )}
              
              {selectedDonation.receipt && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Receipt</p>
                  <div className="border rounded-lg overflow-hidden mt-1">
                    <AspectRatio ratio={16/9}>
                      <img 
                        src={selectedDonation.receipt} 
                        alt="Donation Receipt" 
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
              Close
            </Button>
            
            {selectedDonation && selectedDonation.status === 'Pending' && (
              <div className="flex space-x-2">
                <Button 
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'Completed')}
                >
                  Verify
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleStatusUpdate(selectedDonation.id, 'Rejected')}
                >
                  Reject
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
