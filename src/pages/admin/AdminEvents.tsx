
import React from 'react';

const AdminEvents = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Events Management</h1>
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-medium">All Events</h2>
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white">
            Create New Event
          </button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((event) => (
            <div key={event} className="border border-zinc-700 rounded-lg p-4 bg-zinc-850">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium text-lg">Fundraising Gala {event}</h3>
                  <p className="text-zinc-400 text-sm">June 15, 2023 • 6:00 PM</p>
                </div>
                <div className="space-x-2">
                  <button className="bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-sm">
                    Edit
                  </button>
                  <button className="bg-red-900 hover:bg-red-800 px-3 py-1 rounded text-sm">
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-2 text-zinc-300">
                Annual fundraising event to support community initiatives.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminEvents;
