import React, { useState, useEffect, useRef } from 'react';
import { TeamInput } from './components/TeamInput';
import { TeamCard } from './components/TeamCard';
import { Player, Team, TeamInfo } from './types';
import { generateTeams } from './utils/teamGenerator';
import { Trash2, Zap } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
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
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const generatedTeamsRef = useRef<HTMLDivElement>(null);

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

  // Scroll to generated teams when they are created
  useEffect(() => {
    if (generatedTeams.length > 0 && generatedTeamsRef.current) {
      setTimeout(() => {
        generatedTeamsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start'
        });
      }, 300);
    }
  }, [generatedTeams.length]);

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

  // Prevent touchmove propagation to avoid unwanted page scrolling
  const preventScrollPropagation = (e: React.TouchEvent) => {
    e.stopPropagation();
  };

  const isTeamsComplete = team1.players.length === 11 && team2.players.length === 11;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-8 px-3 sm:px-4 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-4">
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
          <div ref={generatedTeamsRef} className="mt-10 animate-fade-in" id="generated-teams-section">
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

            {/* Mobile view - Simple smooth swiper */}
            <div 
              className="md:hidden swiper-touch-wrapper"
              onTouchStart={preventScrollPropagation}
              onTouchMove={preventScrollPropagation}
            >
              <div className="swiper-container pb-12 touch-none">
                <Swiper
                  modules={[Pagination, A11y]}
                  spaceBetween={16}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  grabCursor={true}
                  speed={300}
                  threshold={5}
                  touchRatio={1.5}
                  resistanceRatio={0.85}
                  watchSlidesProgress={true}
                  preventClicks={false}
                  preventClicksPropagation={false}
                  simulateTouch={true}
                  touchStartPreventDefault={false}
                  className="mobile-swiper"
                >
                  {generatedTeams.map((team, index) => (
                    <SwiperSlide key={index} className="py-2 px-1">
                      <div className="shadow-md rounded-xl overflow-hidden">
                        <TeamCard 
                          team={team} 
                          index={index} 
                          teamInfos={[team1.teamInfo, team2.teamInfo].filter(Boolean) as TeamInfo[]}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <p className="text-center text-gray-500 mt-2 text-sm">
                Swipe to view more teams
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;