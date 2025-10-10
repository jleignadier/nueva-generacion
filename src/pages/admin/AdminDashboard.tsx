
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Activity {
  type: 'donation' | 'user' | 'event';
  title: string;
  person: string;
  timeAgo: string;
  timestamp: Date;
}

const AdminDashboard = () => {
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check current user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);

      // Fetch total events
      const { count: eventsCount, error: eventsError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      console.log('Events count:', eventsCount, 'Error:', eventsError);
      if (eventsError) throw eventsError;

      // Fetch total approved donations amount
      const { data: donationsData, error: donationsError } = await supabase
        .from('donations')
        .select('amount')
        .eq('status', 'approved');

      console.log('Donations data:', donationsData, 'Error:', donationsError);
      if (donationsError) throw donationsError;

      const totalDonationsAmount = donationsData?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Fetch total users
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      console.log('Users count:', usersCount, 'Error:', usersError);
      if (usersError) throw usersError;

      // Update stats
      setTotalEvents(eventsCount || 0);
      setTotalDonations(totalDonationsAmount);
      setActiveUsers(usersCount || 0);
      
      console.log('Final stats:', { eventsCount, totalDonationsAmount, usersCount });

      // Fetch recent activities
      const activities = await fetchRecentActivities();
      setRecentActivities(activities);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivities = async (): Promise<Activity[]> => {
    const activities: Activity[] = [];

    try {
      // Fetch recent users (last 5)
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('first_name, last_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            type: 'user',
            title: 'Nuevo Usuario Registrado',
            person: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Anónimo',
            timeAgo: getTimeAgo(new Date(user.created_at)),
            timestamp: new Date(user.created_at)
          });
        });
      }

      // Fetch recent events (last 5)
      const { data: recentEvents } = await supabase
        .from('events')
        .select(`
          title,
          created_at,
          created_by,
          profiles:created_by (first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentEvents) {
        recentEvents.forEach(event => {
          const creator = event.profiles as any;
          const creatorName = creator 
            ? `${creator.first_name || ''} ${creator.last_name || ''}`.trim() || 'Admin'
            : 'Admin';

          activities.push({
            type: 'event',
            title: `Evento Creado: ${event.title}`,
            person: creatorName,
            timeAgo: getTimeAgo(new Date(event.created_at)),
            timestamp: new Date(event.created_at)
          });
        });
      }

      // Fetch recent approved donations (last 5)
      const { data: approvedDonations } = await supabase
        .from('donations')
        .select(`
          amount,
          created_at,
          profiles:user_id (first_name, last_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(5);

      if (approvedDonations) {
        approvedDonations.forEach(donation => {
          const donor = donation.profiles as any;
          const donorName = donor
            ? `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 'Anónimo'
            : 'Anónimo';

          activities.push({
            type: 'donation',
            title: `Donación Aprobada: $${Number(donation.amount).toLocaleString()}`,
            person: donorName,
            timeAgo: getTimeAgo(new Date(donation.created_at)),
            timestamp: new Date(donation.created_at)
          });
        });
      }

      // Fetch recent pending donations (last 3)
      const { data: pendingDonations } = await supabase
        .from('donations')
        .select(`
          amount,
          created_at,
          profiles:user_id (first_name, last_name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(3);

      if (pendingDonations) {
        pendingDonations.forEach(donation => {
          const donor = donation.profiles as any;
          const donorName = donor
            ? `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || 'Anónimo'
            : 'Anónimo';

          activities.push({
            type: 'donation',
            title: `Nueva Donación Enviada: $${Number(donation.amount).toLocaleString()}`,
            person: donorName,
            timeAgo: getTimeAgo(new Date(donation.created_at)),
            timestamp: new Date(donation.created_at)
          });
        });
      }

      // Sort all activities by timestamp (most recent first) and take top 6
      return activities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 6);

    } catch (err) {
      console.error('Error fetching recent activities:', err);
      return [];
    }
  };
  
  // Helper function to format time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} horas`;
    return `hace ${diffDays} días`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-zinc-400">Cargando datos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="bg-red-900/20 border border-red-700 p-6 rounded-lg">
          <p className="text-red-400">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Resumen</h2>
          <div className="space-y-4">
            <div>
              <p className="text-zinc-400">Total de Eventos</p>
              <p className="text-2xl font-bold">{totalEvents}</p>
            </div>
            <div>
              <p className="text-zinc-400">Total de Donaciones Aprobadas</p>
              <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-zinc-400">Usuarios Registrados</p>
              <p className="text-2xl font-bold">{activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
          <h2 className="text-xl font-medium mb-4">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div 
                key={index}
                className={index < recentActivities.length - 1 ? "border-b border-zinc-700 pb-3" : ""}
              >
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-zinc-400">
                  {activity.type === 'donation' ? 'De: ' : activity.type === 'event' ? 'Por: ' : ''}
                  {activity.person} • {activity.timeAgo}
                </p>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div>
                <p className="text-zinc-400">Sin actividad reciente</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
