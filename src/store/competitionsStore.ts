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
    set((state) => ({
      competitions: [
        ...state.competitions,
        {
          ...competition,
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split('T')[0],
        },
      ],
    })),

  updateCompetition: (id, competitionData) =>
    set((state) => ({
      competitions: state.competitions.map((competition) =>
        competition.id === id ? { ...competition, ...competitionData } : competition
      ),
    })),

  deleteCompetition: (id) =>
    set((state) => ({
      competitions: state.competitions.filter((competition) => competition.id !== id),
    })),

  getActiveCompetition: () => {
    const competitions = get().competitions;
    return competitions.find(competition => competition.isActive);
  },
}));