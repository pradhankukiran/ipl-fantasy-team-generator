import React, { useState, useEffect } from 'react';
import { TeamInput } from './components/TeamInput';
import { TeamCard } from './components/TeamCard';
import { Player, Team, TeamInfo } from './types';
import { generateTeams } from './utils/teamGenerator';
import { Trash2, Zap, Info } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';

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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<boolean>(false);

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

  const handleGenerateTeams = async () => {
    try {
      setIsGenerating(true);
      setError('');
      
      // Add a small delay to allow the loading state to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const teams = generateTeams(team1, team2);
      setGeneratedTeams(teams);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate teams');
      setGeneratedTeams([]);
    } finally {
      setIsGenerating(false);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            IPL Fantasy Team Generator
          </h1>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-all duration-300"
            aria-label="Information"
          >
            <Info size={20} className="text-blue-600" />
          </button>
        </div>
        
        {showInfo && (
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border-l-4 border-blue-500 animate-fade-in">
            <h2 className="font-bold text-lg mb-2">How It Works</h2>
            <p className="text-gray-700 mb-2">
              Select two IPL teams and add their playing XIs. Once both teams are complete, 
              our advanced algorithm will generate 20 unique fantasy teams combining players from both sides.
            </p>
            <p className="text-gray-700">
              Each generated team will have balanced roles (WK, Batters, All-Rounders, Bowlers) 
              and contain 4-7 players from each original team.
            </p>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-800"
            >
              Dismiss
            </button>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="transform transition-all duration-300 hover:-translate-y-1">
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
          <div className="transform transition-all duration-300 hover:-translate-y-1">
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
          <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center shadow-sm animate-fade-in">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {isTeamsComplete && generatedTeams.length === 0 && (
          <div className="mt-8 sm:mt-10 text-center">
            <button
              className={`px-8 py-4 rounded-full shadow-lg font-medium text-white text-lg transition-all duration-300 flex items-center justify-center mx-auto gap-2
              ${isGenerating 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:-translate-y-1'}`}
              onClick={handleGenerateTeams}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Generate 20 Teams
                </>
              )}
            </button>
          </div>
        )}

        {generatedTeams.length > 0 && (
          <div className="mt-10 animate-fade-in">
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Generated Teams</h2>
              <button
                onClick={handleClearGeneratedTeams}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors duration-300 shadow-sm hover:shadow"
              >
                <Trash2 size={16} />
                <span className="font-medium">Clear Teams</span>
              </button>
            </div>

            {/* Desktop view - Grid layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generatedTeams.map((team, index) => (
                <div key={index} className="transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
                  <TeamCard 
                    team={team} 
                    index={index} 
                    teamInfos={[team1.teamInfo, team2.teamInfo].filter(Boolean) as TeamInfo[]}
                  />
                </div>
              ))}
            </div>

            {/* Mobile view - Card Slider */}
            <div className="md:hidden">
              <Swiper
                modules={[Pagination, EffectCards]}
                effect="cards"
                grabCursor={true}
                pagination={{ clickable: true }}
                className="mt-4"
              >
                {generatedTeams.map((team, index) => (
                  <SwiperSlide key={index} className="p-1">
                    <TeamCard 
                      team={team} 
                      index={index} 
                      teamInfos={[team1.teamInfo, team2.teamInfo].filter(Boolean) as TeamInfo[]}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <p className="text-center text-gray-500 mt-5 text-sm">
                Swipe to view more teams
              </p>
            </div>
          </div>
        )}
        
        <footer className="mt-12 sm:mt-16 text-center text-gray-500 text-sm py-4">
          <p>© 2023 IPL Fantasy Team Generator</p>
        </footer>
      </div>
    </div>
  );
}

export default App;