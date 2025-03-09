import React from 'react';
import { Player, PlayerRole, TeamInfo } from '../types';
import { X, Trash2 } from 'lucide-react';
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

  // Generate dynamic styles based on team colors
  const headerStyle = teamInfo ? {
    backgroundColor: teamInfo.primaryColor,
    color: teamInfo.textColor,
  } : {};

  const buttonStyle = teamInfo ? {
    backgroundColor: teamInfo.secondaryColor,
    // Check if secondary color is dark and use white text for better contrast
    color: isLightColor(teamInfo.secondaryColor) ? teamInfo.textColor : '#FFFFFF',
  } : {};

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div 
        className="p-4 sm:p-6"
        style={teamInfo ? { borderTop: `4px solid ${teamInfo.primaryColor}` } : {}}
      >
        <div 
          className="rounded-lg p-3 mb-4"
          style={headerStyle}
        >
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-bold">{teamName}</h2>
            
            <button
              onClick={onClearTeam}
              className="flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors duration-200"
              style={{
                backgroundColor: teamInfo 
                  ? `${teamInfo.textColor}20` // Add transparency to text color
                  : 'rgba(255, 255, 255, 0.2)',
                color: teamInfo?.textColor || 'inherit'
              }}
              title={`Clear ${teamName}`}
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
          
          <select
            value={teamInfo?.id || ''}
            onChange={(e) => {
              const selected = iplTeams.find(team => team.id === e.target.value);
              if (selected) onTeamSelect(selected);
            }}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 transition-shadow duration-200"
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
        </div>
        
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Player name"
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as PlayerRole)}
            className="w-full sm:w-auto px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200"
          >
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={players.length >= 11}
            className="w-full sm:w-auto px-4 py-2 text-white rounded-md hover:opacity-90 disabled:bg-gray-400 transition-all duration-200"
            style={buttonStyle}
          >
            Add Player
          </button>
        </form>

        <div className="space-y-2">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-md transition-all duration-200 hover:bg-gray-100"
              style={teamInfo ? { borderLeft: `3px solid ${teamInfo.primaryColor}` } : {}}
            >
              <div className="flex-1 min-w-0 mr-2">
                <span className="font-medium block text-sm sm:text-base truncate">{player.name}</span>
                <span className="text-xs sm:text-sm text-gray-600">({player.role})</span>
              </div>
              <button
                onClick={() => onPlayerRemove(index)}
                className="text-red-500 hover:text-red-700 flex-shrink-0 transition-colors duration-200"
                aria-label="Remove player"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center sm:text-left">
          {players.length === 11 ? (
            <p className="text-green-600">✓ Team complete!</p>
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