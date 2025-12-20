import { create } from 'zustand';

export interface Competition {
  id: string;
  name: string;
  prize: string;
  endDate: string; // YYYY-MM-DD format
  isActive: boolean;
  createdAt: string;
}

interface CompetitionsState {
  competitions: Competition[];
  addCompetition: (competition: Omit<Competition, 'id' | 'createdAt'>) => void;
  updateCompetition: (id: string, competitionData: Partial<Competition>) => void;
  deleteCompetition: (id: string) => void;
  getActiveCompetition: () => Competition | undefined;
}

// Initial data with one active competition
const initialCompetitions: Competition[] = [
  {
    id: '1',
    name: 'Holiday Volunteer Challenge',
    prize: '$500 Gift Card + Certificate',
    endDate: '2024-12-31',
    isActive: true,
    createdAt: '2024-12-01',
  }
];

export const useCompetitionsStore = create<CompetitionsState>((set, get) => ({
  competitions: initialCompetitions,
  
  addCompetition: (competition) =>
    set((state) => {
      // If new competition is active, deactivate all others
      const updatedCompetitions = competition.isActive
        ? state.competitions.map(c => ({ ...c, isActive: false }))
        : state.competitions;
      
      return {
        competitions: [
          ...updatedCompetitions,
          {
            ...competition,
            id: Date.now().toString(),
            createdAt: new Date().toISOString().split('T')[0],
          },
        ],
      };
    }),

  updateCompetition: (id, competitionData) =>
    set((state) => {
      // If setting this competition to active, deactivate all others first
      let competitions = state.competitions;
      if (competitionData.isActive === true) {
        competitions = competitions.map(c => ({ ...c, isActive: false }));
      }
      
      return {
        competitions: competitions.map((competition) =>
          competition.id === id ? { ...competition, ...competitionData } : competition
        ),
      };
    }),

  deleteCompetition: (id) =>
    set((state) => ({
      competitions: state.competitions.filter((competition) => competition.id !== id),
    })),

  getActiveCompetition: () => {
    const competitions = get().competitions;
    return competitions.find(competition => competition.isActive);
  },
}));