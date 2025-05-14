
import React from 'react';

const AdminDonations = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Donations Management</h1>
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <h2 className="text-xl font-medium mb-6">All Donations</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4">Donor</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'John Doe', amount: '$1,000', date: 'May 12, 2023', status: 'Completed' },
                { name: 'Maria Garcia', amount: '$500', date: 'May 10, 2023', status: 'Completed' },
                { name: 'Robert Smith', amount: '$750', date: 'May 8, 2023', status: 'Pending' },
              ].map((donation, i) => (
                <tr key={i} className="border-b border-zinc-700">
                  <td className="py-3 px-4">{donation.name}</td>
                  <td className="py-3 px-4 font-medium">{donation.amount}</td>
                  <td className="py-3 px-4 text-zinc-400">{donation.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      donation.status === 'Completed' 
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-yellow-900/30 text-yellow-400'
                    }`}>
                      {donation.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-purple-400 hover:text-purple-300">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDonations;
