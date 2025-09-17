import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Bell, Shield } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserSettings {
  notifications: {
    events: boolean;
    donations: boolean;
    general: boolean;
  };
}

const defaultSettings: UserSettings = {
  notifications: {
    events: true,
    donations: true,
    general: false
  }
};

const UserSettingsModal: React.FC<UserSettingsModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('userSettings', JSON.stringify(newSettings));
  };

  const updateNotificationSetting = (key: keyof UserSettings['notifications'], value: boolean) => {
    const newSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    };
    saveSettings(newSettings);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings size={20} className="mr-2 text-primary" />
            Configuración
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Notifications Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Bell size={18} className="mr-2 text-primary" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Eventos</p>
                  <p className="text-sm text-muted-foreground">
                    Notificaciones sobre nuevos eventos
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.events}
                  onCheckedChange={(checked) => updateNotificationSetting('events', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Donaciones</p>
                  <p className="text-sm text-muted-foreground">
                    Estado de tus donaciones
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.donations}
                  onCheckedChange={(checked) => updateNotificationSetting('donations', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">General</p>
                  <p className="text-sm text-muted-foreground">
                    Noticias y actualizaciones
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.general}
                  onCheckedChange={(checked) => updateNotificationSetting('general', checked)}
                />
              </div>
            </CardContent>
          </Card>

        </div>

        <Button onClick={onClose} className="w-full mt-6">
          Guardar y Cerrar
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default UserSettingsModal;