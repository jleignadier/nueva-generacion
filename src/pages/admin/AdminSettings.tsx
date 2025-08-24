
import React from 'react';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ajustes de Administración (Settings)</h1>
      
      <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg">
        <h2 className="text-xl font-medium mb-6">Configuración de Plataforma</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la Organización</label>
            <input 
              type="text" 
              defaultValue="Nueva Generación"
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Contacto de Correo</label>
            <input 
              type="email" 
              defaultValue="contact@ng.org.pa"
              className="w-full bg-zinc-700 border border-zinc-600 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          
          <div className="flex items-center">
            <input 
              id="enableNotifications" 
              type="checkbox" 
              defaultChecked
              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-zinc-600 rounded"
            />
            <label htmlFor="enableNotifications" className="ml-2 block text-sm">
              Permitir Notificaciones por Correo
            </label>
          </div>
          
          <button className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-white mt-4">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
