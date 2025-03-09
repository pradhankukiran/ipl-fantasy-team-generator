import React, { useState, useEffect } from 'react';
import { TeamInput } from './components/TeamInput';
import { TeamCard } from './components/TeamCard';
import { Player, Team, TeamInfo } from './types';
import { generateTeams } from './utils/teamGenerator';
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Define localStorage keys
const STORAGE_KEYS = {
  TEAM1: 'ipl_fantasy_team1',
  TEAM2: 'ipl_fantasy_team2',
  GENERATED_TEAMS: 'ipl_fantasy_generated_teams'
};

function App() {
  const [team1, setTeam1] = useState<Team>({ players: [] });
  const [team2, setTeam2] = useState<Team>({ players: [] });
  const [generatedTeams, setGeneratedTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string>('');

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const storedTeam1 = localStorage.getItem(STORAGE_KEYS.TEAM1);
      const storedTeam2 = localStorage.getItem(STORAGE_KEYS.TEAM2);
      const storedGeneratedTeams = localStorage.getItem(STORAGE_KEYS.GENERATED_TEAMS);

      if (storedTeam1) setTeam1(JSON.parse(storedTeam1));
      if (storedTeam2) setTeam2(JSON.parse(storedTeam2));
      if (storedGeneratedTeams) setGeneratedTeams(JSON.parse(storedGeneratedTeams));
    } catch (err) {
      console.error('Error loading data from localStorage:', err);
    }
  }, []);

  // Save team1 to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM1, JSON.stringify(team1));
  }, [team1]);

  // Save team2 to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TEAM2, JSON.stringify(team2));
  }, [team2]);

  // Save generated teams to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GENERATED_TEAMS, JSON.stringify(generatedTeams));
  }, [generatedTeams]);

  const handleAddPlayer = (team: 'team1' | 'team2', player: Player) => {
    if (team === 'team1') {
      setTeam1({ ...team1, players: [...team1.players, player] });
    } else {
      setTeam2({ ...team2, players: [...team2.players, player] });
    }
    setGeneratedTeams([]);
    setError('');
  };

  const handleRemovePlayer = (team: 'team1' | 'team2', index: number) => {
    if (team === 'team1') {
      setTeam1({
        ...team1,
        players: team1.players.filter((_, i) => i !== index),
      });
    } else {
      setTeam2({
        ...team2,
        players: team2.players.filter((_, i) => i !== index),
      });
    }
    setGeneratedTeams([]);
    setError('');
  };

  const handleTeamSelect = (team: 'team1' | 'team2', teamInfo: TeamInfo) => {
    if (team === 'team1') {
      setTeam1({ ...team1, teamInfo });
    } else {
      setTeam2({ ...team2, teamInfo });
    }
    setGeneratedTeams([]);
    setError('');
  };

  const handleGenerateTeams = () => {
    try {
      const teams = generateTeams(team1, team2);
      setGeneratedTeams(teams);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate teams');
      setGeneratedTeams([]);
    }
  };

  const handleClearTeam = (team: 'team1' | 'team2') => {
    if (team === 'team1') {
      setTeam1({ players: [] });
    } else {
      setTeam2({ players: [] });
    }
    setGeneratedTeams([]);
    setError('');
  };

  const handleClearGeneratedTeams = () => {
    setGeneratedTeams([]);
  };

  const isTeamsComplete = team1.players.length === 11 && team2.players.length === 11;

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8">
          IPL Fantasy Team Generator
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div>
            <TeamInput
              teamName={team1.teamInfo?.name || "Team 1"}
              players={team1.players}
              onPlayerAdd={(player) => handleAddPlayer('team1', player)}
              onPlayerRemove={(index) => handleRemovePlayer('team1', index)}
              teamInfo={team1.teamInfo}
              onTeamSelect={(teamInfo) => handleTeamSelect('team1', teamInfo)}
              disabledTeamIds={team2.teamInfo ? [team2.teamInfo.id] : []}
              onClearTeam={() => handleClearTeam('team1')}
            />
          </div>
          <div>
            <TeamInput
              teamName={team2.teamInfo?.name || "Team 2"}
              players={team2.players}
              onPlayerAdd={(player) => handleAddPlayer('team2', player)}
              onPlayerRemove={(index) => handleRemovePlayer('team2', index)}
              teamInfo={team2.teamInfo}
              onTeamSelect={(teamInfo) => handleTeamSelect('team2', teamInfo)}
              disabledTeamIds={team1.teamInfo ? [team1.teamInfo.id] : []}
              onClearTeam={() => handleClearTeam('team2')}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md text-center">
            {error}
          </div>
        )}

        {isTeamsComplete && generatedTeams.length === 0 && (
          <div className="mt-6 sm:mt-8 text-center">
            <button
              className="w-full sm:w-auto px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
              onClick={handleGenerateTeams}
            >
              Generate 20 Teams
            </button>
          </div>
        )}

        {generatedTeams.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Generated Teams</h2>
              <button
                onClick={handleClearGeneratedTeams}
                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
              >
                <Trash2 size={16} />
                <span>Clear Teams</span>
              </button>
            </div>

            {/* Desktop view */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedTeams.map((team, index) => (
                <TeamCard 
                  key={index} 
                  team={team} 
                  index={index} 
                  teamInfos={[team1.teamInfo, team2.teamInfo].filter(Boolean) as TeamInfo[]}
                />
              ))}
            </div>

            {/* Mobile view with swiper */}
            <div className="md:hidden relative">
              <Swiper
                modules={[Pagination]}
                spaceBetween={16}
                slidesPerView={1}
                pagination={{ clickable: true }}
                className="pb-10"
              >
                {generatedTeams.map((team, index) => (
                  <SwiperSlide key={index}>
                    <TeamCard 
                      team={team} 
                      index={index} 
                      teamInfos={[team1.teamInfo, team2.teamInfo].filter(Boolean) as TeamInfo[]}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;