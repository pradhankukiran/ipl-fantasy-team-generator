import React from 'react';
import { Team, TeamInfo, Player, TeamOrigin, PlayerRole } from '../types';

interface TeamCardProps {
  team: Team;
  index: number;
  teamInfos: TeamInfo[];
}

export function TeamCard({ team, index, teamInfos }: TeamCardProps) {
  // Pick a color theme based on team index for variety
  const teamColor = teamInfos[index % teamInfos.length];
  
  const headerStyle = teamColor ? {
    backgroundColor: teamColor.primaryColor,
    color: teamColor.textColor,
  } : {};
  
  // Ensure role tag has good contrast with background
  const roleStyle = teamColor ? {
    backgroundColor: teamColor.secondaryColor,
    color: teamColor.textColor,
    // Add a border if the text/background contrast might be low
    border: isLightColor(teamColor.secondaryColor) && teamColor.textColor === '#FFFFFF' 
      ? '1px solid #666666' 
      : 'none'
  } : {
    backgroundColor: '#e6f0ff',
    color: '#0047b3'
  };

  // Define the role order
  const roleOrder: PlayerRole[] = ['WK', 'Batter', 'All-Rounder', 'Bowler'];
  
  // Sort players by role according to the defined order
  const sortedPlayers = [...team.players].sort((a, b) => {
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

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
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0"
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full">
      <div 
        className="p-3 font-bold text-lg"
        style={headerStyle}
      >
        Team {index + 1}
      </div>
      <div className="p-4 space-y-2">
        {sortedPlayers.map((player, playerIndex) => (
          <div
            key={playerIndex}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            style={teamColor ? { borderLeft: `3px solid ${teamColor.primaryColor}` } : {}}
          >
            <div className="flex items-center flex-1 min-w-0">
              {getPlayerTeamIcon(player)}
              <span className="font-medium truncate">{player.name}</span>
            </div>
            <span 
              className="text-sm px-2 py-1 rounded ml-2 flex-shrink-0" 
              style={roleStyle}
            >
              {player.role}
            </span>
          </div>
        ))}
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