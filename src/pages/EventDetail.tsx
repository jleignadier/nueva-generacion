
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, MapPin, ArrowLeft, Users, Share2, ScanQrCode, Award, Calendar, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEventsStore } from '@/store/eventsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRScanner from '@/components/QRScanner';
import { getEventRegistrationStatus, registerForEvent, markEventAttended, downloadCalendarFile, isEventToday } from '@/utils/eventUtils';

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrationStatus, setRegistrationStatus] = useState({
    isRegistered: false,
    hasAttended: false,
    canScanQR: false,
    canRegister: false,
    isEventPast: false
  });
  const [scannerOpen, setScannerOpen] = useState(false);
  
  const { getEvent } = useEventsStore();
  
  // Find the event based on the ID parameter
  const event = id ? getEvent(id) : undefined;
  
  // Check registration and attendance status
  useEffect(() => {
    if (id && event) {
      const status = getEventRegistrationStatus(id, event.date);
      setRegistrationStatus(status);
    }
  }, [id, event]);

  if (!event) {
    return (
      <div className="app-container p-4">
        <h1 className="text-xl font-bold">Event not found</h1>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} className="mr-2" />
          Return to Home
        </Button>
      </div>
    );
  }

  const handleRegisterForReminder = () => {
    if (!event || !id) return;
    
    // Register for the event (calendar reminder)
    registerForEvent(id);
    
    // Download calendar file
    downloadCalendarFile({
      title: event.title,
      date: event.date,
      time: event.time,
      endTime: event.endTime,
      location: event.location,
      description: event.description
    });
    
    // Update local state
    setRegistrationStatus(prev => ({ ...prev, isRegistered: true, canRegister: false }));
    
    // Show success toast
    toast({
      title: "Registered for reminder!",
      description: `Calendar event added for ${event.title}. Remember to scan the QR code on event day for attendance.`,
    });
  };

  const handleScanQR = () => {
    // Only allow QR scanning on the event day
    if (!event || !isEventToday(event.date)) {
      toast({
        title: "QR scanning not available",
        description: "QR code scanning is only available on the day of the event.",
        variant: "destructive"
      });
      return;
    }
    setScannerOpen(true);
  };

  const handleQRSuccess = (result: string) => {
    if (!event || !id) return;
    
    // Close the scanner
    setScannerOpen(false);

    // Validate the QR code - in a real app this would verify if the QR code 
    // matches the event ID or contains a valid participation token
    if (result.includes(event.id) || result === 'valid-qr-code') {
      // Mark attendance
      markEventAttended(id);
      
      // Update local state
      setRegistrationStatus(prev => ({ ...prev, hasAttended: true, canScanQR: false }));
      
      // Show success toast
      toast({
        title: "Attendance recorded!",
        description: `You've successfully checked in to ${event.title}. Points and volunteer hours have been awarded.`,
      });
    } else {
      // Invalid QR code
      toast({
        title: "Invalid QR Code",
        description: "The scanned QR code is not valid for this event.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    // In a real app, this would open a proper share dialog
    toast({
      title: "Share feature",
      description: "Sharing functionality would be implemented here",
    });
  };

  // Use direct route for navigation - maintain the '/dashboard' path
  const handleBack = () => {
    navigate('/dashboard');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Format time for display
  const formatTime = (startTime: string, endTime?: string) => {
    const formatTimeString = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };
    
    if (!endTime) return formatTimeString(startTime);
    return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
  };

  return (
    <div className="app-container p-4">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={handleBack}
      >
        <ArrowLeft size={16} className="mr-2" />
        Back
      </Button>
      
      <div className="rounded-lg overflow-hidden mb-4">
        <img 
          src={event.image} 
          alt={event.title}
          className="w-full h-48 object-cover" 
        />
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{event.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div className="flex items-center">
              <CalendarCheck size={16} className="mr-2 text-nuevagen-blue" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-nuevagen-pink" />
              <span>{formatTime(event.time, event.endTime)}</span>
            </div>
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-nuevagen-green" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center">
              <Users size={16} className="mr-2 text-nuevagen-purple" />
              <span>{event.participantCount} participants</span>
            </div>
            <div className="flex items-center">
              <Award size={16} className="mr-2 text-nuevagen-yellow" />
              <span>{event.volunteerHours} volunteer hours</span>
            </div>
          </div>
          
          <div className="border-t border-b py-4 my-4">
            <h3 className="font-medium mb-2">About this event</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <p className="text-sm text-gray-600">Points for participation</p>
                <p className="font-medium text-lg text-nuevagen-blue">{event.pointsEarned} points</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Volunteer hours credit</p>
                <p className="font-medium text-lg text-nuevagen-yellow">{event.volunteerHours} hours</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            {registrationStatus.hasAttended ? (
              <Button className="flex-1" disabled variant="secondary">
                <CheckCircle size={16} className="mr-2" />
                Attended ✓
              </Button>
            ) : registrationStatus.canScanQR ? (
              <Button 
                className="flex-1" 
                onClick={handleScanQR}
              >
                <ScanQrCode size={16} className="mr-2" />
                Scan QR for Attendance
              </Button>
            ) : registrationStatus.canRegister ? (
              <Button 
                className="flex-1" 
                onClick={handleRegisterForReminder}
                variant="outline"
              >
                <Calendar size={16} className="mr-2" />
                Register for Reminder
              </Button>
            ) : registrationStatus.isRegistered && !registrationStatus.hasAttended ? (
              <Button className="flex-1" disabled>
                <Calendar size={16} className="mr-2" />
                {registrationStatus.canScanQR ? 'Registered - Scan QR Today' : 'Registered'}
              </Button>
            ) : (
              <Button className="flex-1" disabled>
                Event Completed
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleShare}
            >
              <Share2 size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Scanner Dialog */}
      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Event QR Code for Attendance</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Scanning this QR code will mark your attendance and award you {event?.pointsEarned} points 
              and {event?.volunteerHours} volunteer hours.
            </p>
          </div>
          <QRScanner onSuccess={handleQRSuccess} onClose={() => setScannerOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetail;
