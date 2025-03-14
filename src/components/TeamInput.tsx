import React from 'react';
import { Player, PlayerRole, TeamInfo } from '../types';
import { X, Trash2, Plus, Users } from 'lucide-react';
import { iplTeams } from '../data/iplTeams';

interface TeamInputProps {
  teamName: string;
  players: Player[];
  onPlayerAdd: (player: Player) => void;
  onPlayerRemove: (index: number) => void;
  teamInfo?: TeamInfo;
  onTeamSelect: (teamInfo: TeamInfo) => void;
  disabledTeamIds?: string[];
  onClearTeam: () => void;
}

const roles: PlayerRole[] = ['WK', 'Batter', 'All-Rounder', 'Bowler'];

export function TeamInput({ 
  teamName, 
  players, 
  onPlayerAdd, 
  onPlayerRemove, 
  teamInfo,
  onTeamSelect,
  disabledTeamIds = [],
  onClearTeam
}: TeamInputProps) {
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<PlayerRole>('Batter');
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onPlayerAdd({ name: name.trim(), role });
      setName('');
    }
  };

  // Helper function to determine if a color is light
  const isLightColor = (color: string): boolean => {
    // Convert hex to RGB
    let r = 0, g = 0, b = 0;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    }
    // Calculate brightness (YIQ formula)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    // Return true if the color is light (brightness > 128)
    return brightness > 128;
  };

  // Generate player count by role
  const playerCountByRole = players.reduce((acc, player) => {
    acc[player.role] = (acc[player.role] || 0) + 1;
    return acc;
  }, {} as Record<PlayerRole, number>);

  // Generate dynamic styles based on team colors
  const headerStyle = teamInfo ? {
    background: `linear-gradient(135deg, ${teamInfo.primaryColor}, ${teamInfo.secondaryColor})`,
    color: teamInfo.textColor,
  } : {
    background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)',
    color: '#333',
  };

  const buttonStyle = teamInfo ? {
    backgroundColor: teamInfo.secondaryColor,
    // Check if secondary color is dark and use white text for better contrast
    color: isLightColor(teamInfo.secondaryColor) ? teamInfo.textColor : '#FFFFFF',
  } : {
    backgroundColor: '#4f46e5',
    color: '#FFFFFF',
  };

  const progressPercentage = (players.length / 11) * 100;
  const progressColor = teamInfo ? teamInfo.primaryColor : '#4f46e5';

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div 
        className="py-5 px-6 flex justify-between items-center"
        style={headerStyle}
      >
        <div>
          <h2 className="text-xl font-bold">{teamName}</h2>
          <div className="mt-1 text-sm opacity-90">
            {players.length === 11 ? 'Complete XI' : `${players.length}/11 players`}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearTeam}
            className="p-2 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: teamInfo 
                ? `${teamInfo.textColor}20` // Add transparency to text color
                : 'rgba(255, 255, 255, 0.2)',
              color: teamInfo?.textColor || 'inherit'
            }}
            title={`Clear ${teamName}`}
          >
            <Trash2 size={16} />
          </button>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full transition-colors duration-200 md:hidden"
            style={{
              backgroundColor: teamInfo 
                ? `${teamInfo.textColor}20` // Add transparency to text color
                : 'rgba(255, 255, 255, 0.2)',
              color: teamInfo?.textColor || 'inherit'
            }}
            title="Toggle players list"
          >
            <Users size={16} />
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="h-1 w-full bg-gray-200">
        <div 
          className="h-full transition-all duration-500 ease-in-out"
          style={{ 
            width: `${progressPercentage}%`, 
            backgroundColor: progressColor
          }}
        ></div>
      </div>
      
      <div className="p-5">
        <select
          value={teamInfo?.id || ''}
          onChange={(e) => {
            const selected = iplTeams.find(team => team.id === e.target.value);
            if (selected) onTeamSelect(selected);
          }}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-800 transition-shadow duration-200 mb-4"
        >
          <option value="">Select IPL Team</option>
          {iplTeams.map((team) => (
            <option 
              key={team.id} 
              value={team.id}
              disabled={disabledTeamIds.includes(team.id)}
            >
              {team.name}
            </option>
          ))}
        </select>
        
        <form onSubmit={handleSubmit} className="mb-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Player name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
              />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PlayerRole)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={players.length >= 11 || !name.trim()}
              className="px-5 py-2.5 rounded-lg text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                ...buttonStyle,
                opacity: players.length >= 11 || !name.trim() ? 0.6 : 1,
                cursor: players.length >= 11 || !name.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Role Counts */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {roles.map(r => (
            <div 
              key={r} 
              className="text-center p-2 rounded-lg bg-gray-50"
              style={teamInfo ? { borderTop: `2px solid ${teamInfo.primaryColor}` } : {}}
            >
              <div className="text-xs text-gray-500">{r}</div>
              <div className="font-bold text-gray-800">{playerCountByRole[r] || 0}</div>
            </div>
          ))}
        </div>

        <div className={`space-y-2 transition-all duration-500 ${isCollapsed ? 'max-h-0 overflow-hidden opacity-0' : 'max-h-[1000px] opacity-100'}`}>
          {players.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              No players added yet
            </div>
          ) : (
            players.map((player, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:bg-gray-50"
                style={teamInfo ? { 
                  borderLeft: `3px solid ${teamInfo.primaryColor}`,
                  backgroundColor: 'rgba(249, 250, 251, 0.8)'
                } : {
                  borderLeft: '3px solid #e5e7eb',
                  backgroundColor: 'rgba(249, 250, 251, 0.8)'
                }}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <span className="font-medium block text-sm sm:text-base truncate">{player.name}</span>
                  <span 
                    className="text-xs inline-block px-2 py-0.5 rounded-full mt-1"
                    style={{
                      backgroundColor: teamInfo ? `${teamInfo.primaryColor}20` : '#f3f4f6',
                      color: teamInfo ? teamInfo.primaryColor : '#4b5563'
                    }}
                  >
                    {player.role}
                  </span>
                </div>
                <button
                  onClick={() => onPlayerRemove(index)}
                  className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 flex-shrink-0 transition-colors duration-200"
                  aria-label="Remove player"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 text-center">
          {players.length === 11 ? (
            <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-medium">
              ✓ Team complete!
            </div>
          ) : (
            <p className="text-gray-600">
              {11 - players.length} more player{11 - players.length !== 1 ? 's' : ''} needed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}