import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Building2, Plus } from 'lucide-react';
import { RegisteredParticipant } from '@/store/eventsStore';

interface EventParticipantsProps {
  participants: RegisteredParticipant[];
  totalCount: number;
}

const EventParticipants: React.FC<EventParticipantsProps> = ({ participants, totalCount }) => {
  // Show first 3 participants and a +more indicator
  const displayParticipants = participants.slice(0, 3);
  const remainingCount = Math.max(0, totalCount - 3);

  const getParticipantIcon = (type: 'user' | 'organization') => {
    return type === 'organization' ? Building2 : Users;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center -space-x-2">
        {displayParticipants.map((participant) => {
          const Icon = getParticipantIcon(participant.type);
          return (
            <div key={participant.id} className="relative">
              <Avatar className="w-8 h-8 border-2 border-background">
                <AvatarImage 
                  src={participant.avatar} 
                  alt={participant.name}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(participant.name)}
                </AvatarFallback>
              </Avatar>
              {participant.type === 'organization' && (
                <Badge 
                  variant="secondary" 
                  className="absolute -bottom-1 -right-1 w-4 h-4 p-0 flex items-center justify-center"
                >
                  <Building2 size={8} />
                </Badge>
              )}
            </div>
          );
        })}
        
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
            <Plus size={12} className="text-muted-foreground" />
          </div>
        )}
      </div>
      
      <div className="flex flex-col text-xs">
        <span className="font-medium">{totalCount} participantes</span>
        <span className="text-muted-foreground">
          {participants.filter(p => p.type === 'user').length} usuarios, {' '}
          {participants.filter(p => p.type === 'organization').length} organizaciones
        </span>
      </div>
    </div>
  );
};

export default EventParticipants;