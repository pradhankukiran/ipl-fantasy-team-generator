import { Player, PlayerRole, Team, TeamInfo, TeamOrigin } from '../types';

// Validate if a team has at least one player of each role
function isValidTeam(players: Player[]): boolean {
  const roles = new Set(players.map(player => player.role));
  return roles.has('WK') && 
         roles.has('Batter') && 
         roles.has('All-Rounder') && 
         roles.has('Bowler');
}

// Generate a unique key for a team to check for duplicates
function getTeamKey(players: Player[]): string {
  return players
    .map(p => p.name)
    .sort()
    .join('|');
}

// Calculate a random team composition ensuring at least 4 players from each team
function getRandomTeamComposition(): [number, number] {
  // Randomly choose between 4-7 players from team1
  const team1Count = Math.floor(Math.random() * 4) + 4; // 4, 5, 6, or 7
  const team2Count = 11 - team1Count; // Remaining spots for team2
  
  return [team1Count, team2Count];
}

export function generateTeams(team1: Team, team2: Team): Team[] {
  // Create player arrays with team origin info
  const team1Players = team1.players.map(player => ({
    ...player,
    originalTeam: 'team1' as TeamOrigin
  }));
  
  const team2Players = team2.players.map(player => ({
    ...player,
    originalTeam: 'team2' as TeamOrigin
  }));
  
  const teams: Team[] = [];
  const usedTeamKeys = new Set<string>();
  
  // Maximum attempts to prevent infinite loops
  const MAX_ATTEMPTS = 20000;
  let attempts = 0;

  while (teams.length < 20 && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Get a random composition for this team
    const [team1Count, team2Count] = getRandomTeamComposition();
    
    // Create a candidate team with the required distribution
    let candidateTeam: Player[] = [];
    
    // Try to create a valid team with the required distribution
    try {
      // Shuffle both team player arrays
      const shuffledTeam1 = [...team1Players].sort(() => Math.random() - 0.5);
      const shuffledTeam2 = [...team2Players].sort(() => Math.random() - 0.5);
      
      // Pick the required number of players from each team
      candidateTeam = [
        ...shuffledTeam1.slice(0, team1Count),
        ...shuffledTeam2.slice(0, team2Count)
      ];
      
      // Check if team is valid
      if (!isValidTeam(candidateTeam)) {
        continue; // Skip this attempt and try again
      }
      
      // Generate a key to check for duplicates
      const teamKey = getTeamKey(candidateTeam);
      
      // Add the team if it's unique
      if (!usedTeamKeys.has(teamKey)) {
        teams.push({ 
          players: candidateTeam
        });
        usedTeamKeys.add(teamKey);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      continue;
    }
  }

  if (teams.length < 20) {
    throw new Error('Could not generate 20 unique valid teams. Try adding more variety in player roles.');
  }

  return teams;
}