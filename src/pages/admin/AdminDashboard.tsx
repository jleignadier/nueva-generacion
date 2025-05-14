
import React, { useState, useEffect } from 'react';

interface Donation {
  id: string;
  name: string;
  amount: string;
  date: string;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Completed';
  receipt?: string;
  note?: string;
}

interface Activity {
  type: 'donation' | 'user' | 'event';
  title: string;
  person: string;
  timeAgo: string;
}

const AdminDashboard = () => {
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    // Load all donations to calculate total
    const userDonations = JSON.parse(localStorage.getItem('submittedDonations') || '[]');
    const mockDonations = JSON.parse(localStorage.getItem('mockDonations') || '[]');
    const allDonations = [...userDonations, ...mockDonations];
    
    // Calculate total donations amount
    let total = 0;
    
    allDonations.forEach((donation: any) => {
      if (donation.amount) {
        // Handle formatted strings like '$1,000'
        const numAmount = typeof donation.amount === 'string' && donation.amount.startsWith('$') 
          ? parseFloat(donation.amount.replace(/[$,]/g, ''))
          : parseFloat(donation.amount);
          
        if (!isNaN(numAmount)) {
          total += numAmount;
        }
      }
    });
    
    setTotalDonations(total);
    
    // Generate base recent activities
    const baseActivities: Activity[] = [
      {
        type: 'user',
        title: 'New User Registered',
        person: 'Maria Garcia',
        timeAgo: '5 hours ago'
      },
      {
        type: 'event',
        title: 'Event Created: Fundraising Gala',
        person: 'Admin',
        timeAgo: '1 day ago'
      }
    ];
    
    // Add recent verified and completed donations to activities
    const recentDonations = allDonations
      .filter((donation: any) => donation.status === 'Verified' || donation.status === 'Completed')
      .sort((a: any, b: any) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime())
      .slice(0, 4); // Get only the 4 most recent
    
    const donationActivities = recentDonations.map((donation: any) => ({
      type: 'donation' as const,
      title: `Donation Verified: ${donation.amount}`,
      person: donation.name || 'Anonymous',
      timeAgo: getTimeAgo(new Date(donation.date || Date.now()))
    }));
    
    // Add newly submitted donations (pending) to activities
    const pendingDonations = allDonations
      .filter((donation: any) => donation.status === 'Pending')
      .sort((a: any, b: any) => new Date(b.date || Date.now()).getTime() - new Date(a.date || Date.now()).getTime())
      .slice(0, 2); // Show max 2 pending donations
      
    const pendingActivities = pendingDonations.map((donation: any) => ({
      type: 'donation' as const,
      title: `New Donation Submitted: ${donation.amount}`,
      person: donation.name || 'Anonymous',
      timeAgo: getTimeAgo(new Date(donation.date || Date.now()))
    }));
    
    setRecentActivities([...donationActivities, ...pendingActivities, ...baseActivities].slice(0, 6)); // Limit to 6 activities
  }, []);
  
  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Overview</h2>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400">Total Events</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <div>
              <p className="text-zinc-400">Total Donations</p>
              <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400">Active Users</p>
              <p className="text-2xl font-bold">347</p>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className={index < recentActivities.length - 1 ? "border-b border-zinc-700 pb-3" : ""}
              >
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-zinc-400">
                  {activity.type === 'donation' ? 'From: ' : activity.type === 'event' ? 'By: ' : ''}
                  {activity.person} • {activity.timeAgo}
                </p>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div>
                <p className="text-zinc-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
