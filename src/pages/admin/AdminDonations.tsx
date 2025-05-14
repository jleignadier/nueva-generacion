import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

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

    setDonations([...formattedUserDonations, ...mockDonations]);
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
                        className="text-white hover:text-white"
                        onClick={() => {
                          toast({
                            title: "Donation details",
                            description: donation.note 
                              ? `Note: ${donation.note}` 
                              : "No additional details available"
                          });
                        }}
                      >
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
    </div>
  );
};

export default AdminDonations;
