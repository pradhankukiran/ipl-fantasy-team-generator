import React from 'react';
import { Team, TeamInfo, Player, TeamOrigin, PlayerRole } from '../types';
import { Shield } from 'lucide-react';

interface TeamCardProps {
  team: Team;
  index: number;
  teamInfos: TeamInfo[];
}

export function TeamCard({ team, index, teamInfos }: TeamCardProps) {
  // Pick a color theme based on team index for variety
  const teamColor = teamInfos[index % teamInfos.length];
  
  const headerStyle = teamColor ? {
    background: `linear-gradient(135deg, ${teamColor.primaryColor}, ${teamColor.secondaryColor})`,
    color: teamColor.textColor,
  } : {
    background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
    color: '#FFFFFF'
  };
  
  // Define the role order
  const roleOrder: PlayerRole[] = ['WK', 'Batter', 'All-Rounder', 'Bowler'];
  
  // Sort players by role according to the defined order
  const sortedPlayers = [...team.players].sort((a, b) => {
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  // Count players by role
  const playersByRole = sortedPlayers.reduce((acc, player) => {
    acc[player.role] = (acc[player.role] || 0) + 1;
    return acc;
  }, {} as Record<PlayerRole, number>);

  // Count players by team
  const playersByTeam = sortedPlayers.reduce((acc, player) => {
    if (player.originalTeam) {
      acc[player.originalTeam] = (acc[player.originalTeam] || 0) + 1;
    }
    return acc;
  }, {} as Record<TeamOrigin, number>);

  // Get team info based on player's original team
  const getPlayerTeamInfo = (player: Player): TeamInfo | undefined => {
    if (!player.originalTeam || teamInfos.length === 0) return undefined;
    
    // Look up the team info for the player's original team
    const teamIndex = player.originalTeam === 'team1' ? 0 : 1;
    return teamInfos[teamIndex % teamInfos.length];
  };

  // Map team IDs to their official abbreviations
  const getTeamAbbreviation = (teamId: string): string => {
    const abbreviations: Record<string, string> = {
      'rcb': 'RCB',
      'kkr': 'KKR',
      'csk': 'CSK',
      'mi': 'MI',
      'srh': 'SRH',
      'dc': 'DC',
      'gt': 'GT',
      'lsg': 'LSG',
      'rr': 'RR',
      'pbks': 'PBKS'
    };
    
    return abbreviations[teamId] || teamId.toUpperCase();
  };

  // Create a team icon for a player
  const getPlayerTeamIcon = (player: Player) => {
    const teamInfo = getPlayerTeamInfo(player);
    
    if (!teamInfo) return null;
    
    const abbreviation = getTeamAbbreviation(teamInfo.id);
    
    // Use shorter display for smaller badges
    const displayText = abbreviation.length > 3 ? abbreviation.substring(0, 2) : abbreviation;
    
    return (
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          backgroundColor: teamInfo.primaryColor,
          color: teamInfo.textColor,
          border: isLightColor(teamInfo.primaryColor) ? '1px solid #666' : 'none'
        }}
        title={`${getTeamAbbreviation(teamInfo.id)} - ${teamInfo.name}`}
      >
        {displayText}
      </div>
    );
  };

  // Get role color based on the player's role
  const getRoleColor = (role: PlayerRole) => {
    const roleColors: Record<PlayerRole, { bg: string, text: string }> = {
      'WK': { bg: '#fef3c7', text: '#92400e' },
      'Batter': { bg: '#fee2e2', text: '#b91c1c' },
      'All-Rounder': { bg: '#e0e7ff', text: '#4338ca' },
      'Bowler': { bg: '#d1fae5', text: '#047857' }
    };
    
    return roleColors[role];
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full transform transition-all duration-300">
      <div 
        className="py-4 px-5 font-bold flex justify-between items-center"
        style={headerStyle}
      >
        <h3 className="text-lg font-bold">Team {index + 1}</h3>
        
        {/* Team composition badge */}
        <div className="flex gap-1 items-center bg-black bg-opacity-20 py-1 px-2 rounded-full text-xs">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: teamInfos[0]?.primaryColor || '#ccc' }}
          ></div>
          <span>{playersByTeam['team1'] || 0}</span>
          <span>-</span>
          <span>{playersByTeam['team2'] || 0}</span>
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: teamInfos[1]?.primaryColor || '#ccc' }}
          ></div>
        </div>
      </div>
      
      {/* Role counts */}
      <div className="grid grid-cols-4 gap-1 p-2 bg-gray-50 border-b">
        {roleOrder.map(role => (
          <div key={role} className="text-center py-1">
            <div className="text-xs text-gray-500">{role === 'All-Rounder' ? 'AR' : role}</div>
            <div className="font-bold text-xs sm:text-sm">{playersByRole[role] || 0}</div>
          </div>
        ))}
      </div>
      
      <div className="p-3 space-y-1.5">
        {sortedPlayers.map((player, playerIndex) => {
          const roleColor = getRoleColor(player.role);
          
          return (
            <div
              key={playerIndex}
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {getPlayerTeamIcon(player)}
                <span className="font-medium text-sm truncate">{player.name}</span>
              </div>
              <span 
                className="text-xs px-2 py-0.5 rounded-full ml-1 flex-shrink-0" 
                style={{ 
                  backgroundColor: roleColor.bg,
                  color: roleColor.text
                }}
              >
                {player.role === 'All-Rounder' ? 'AR' : player.role}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Shield size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">Fantasy XI</span>
        </div>
        
        {teamInfos.length === 2 && (
          <div className="flex">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: teamInfos[0]?.primaryColor }}
              title={teamInfos[0]?.name}
            ></div>
            <div 
              className="w-4 h-4 rounded-full border-2 border-white -ml-1"
              style={{ backgroundColor: teamInfos[1]?.primaryColor }}
              title={teamInfos[1]?.name}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to determine if a color is light
function isLightColor(color: string): boolean {
  // Remove the # if it exists
  const hex = color.replace('#', '');
  
  // Parse the hex value to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if the color is light, false if it's dark
  return brightness > 128;
}