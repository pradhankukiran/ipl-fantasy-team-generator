import { Player, PlayerRole, Team, TeamInfo, TeamOrigin } from '../types';

// Types for the structured team generation approach
type PlayersByRole = {
  WK: Player[];
  Batter: Player[];
  'All-Rounder': Player[];
  Bowler: Player[];
};

type RoleDistribution = {
  team1: {
    WK: number;
    Batter: number;
    'All-Rounder': number;
    Bowler: number;
  };
  team2: {
    WK: number;
    Batter: number;
    'All-Rounder': number;
    Bowler: number;
  };
};

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

// Categorize players by their roles for easier team composition
function categorizePlayersByRole(players: Player[], team: TeamOrigin): PlayersByRole {
  const playersByRole: PlayersByRole = {
    WK: [],
    Batter: [],
    'All-Rounder': [],
    Bowler: []
  };

  players.forEach(player => {
    const playerWithTeam = {
      ...player,
      originalTeam: team
    };
    playersByRole[player.role].push(playerWithTeam);
  });

  return playersByRole;
}

// Get all combinations of k elements from an array
function getCombinations<T>(array: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (k > array.length) return [];
  
  if (k === array.length) return [array];
  
  const result: T[][] = [];
  
  // Take the first element and get k-1 combinations from the rest
  const first = array[0];
  const withFirst = getCombinations(array.slice(1), k - 1).map(combo => [first, ...combo]);
  
  // Get k combinations without the first element
  const withoutFirst = getCombinations(array.slice(1), k);
  
  return [...withFirst, ...withoutFirst];
}

// Generate valid role distributions that ensure 4-7 players from each team
// and at least one player of each role
function generateRoleDistributions(
  team1ByRole: PlayersByRole,
  team2ByRole: PlayersByRole
): RoleDistribution[] {
  const distributions: RoleDistribution[] = [];
  
  // Try combinations for team1Count from 4 to 7
  for (let team1Count = 4; team1Count <= 7; team1Count++) {
    const team2Count = 11 - team1Count;
    
    // Generate all possible combinations of role counts for team1
    // that total to team1Count
    for (let wk = 0; wk <= Math.min(team1ByRole.WK.length, 2); wk++) {
      for (let bat = 0; bat <= Math.min(team1ByRole.Batter.length, 5); bat++) {
        for (let ar = 0; ar <= Math.min(team1ByRole['All-Rounder'].length, 5); ar++) {
          const bowl = team1Count - wk - bat - ar;
          
          // Skip invalid combinations where bowler count is negative or exceeds available bowlers
          if (bowl < 0 || bowl > team1ByRole.Bowler.length) continue;
          
          // For each valid team1 distribution, create a corresponding team2 distribution
          const team2WK = Math.min(team2ByRole.WK.length, 1 - Math.min(wk, 1) + 1);
          const team2Bat = Math.min(team2ByRole.Batter.length, 1 - Math.min(bat, 1) + 4);
          const team2AR = Math.min(team2ByRole['All-Rounder'].length, 1 - Math.min(ar, 1) + 4);
          const team2Bowl = Math.min(team2ByRole.Bowler.length, 1 - Math.min(bowl, 1) + 4);
          
          // Make sure we can fit team2Count players from team2
          const maxTeam2 = team2WK + team2Bat + team2AR + team2Bowl;
          if (maxTeam2 < team2Count) continue;
          
          // Prioritize distributions that ensure at least one of each role in the final team
          if ((wk > 0 || team2WK > 0) && 
              (bat > 0 || team2Bat > 0) && 
              (ar > 0 || team2AR > 0) && 
              (bowl > 0 || team2Bowl > 0)) {
            
            distributions.push({
              team1: { WK: wk, Batter: bat, 'All-Rounder': ar, Bowler: bowl },
              team2: { WK: 0, Batter: 0, 'All-Rounder': 0, Bowler: 0 } // Will be filled later
            });
          }
          
          // Limit the number of distributions to prevent excessive computation
          if (distributions.length >= 50) break;
        }
        if (distributions.length >= 50) break;
      }
      if (distributions.length >= 50) break;
    }
  }
  
  // Shuffle distributions to ensure variety
  return distributions.sort(() => Math.random() - 0.5);
}

// Generate teams based on a specific role distribution
function generateTeamsFromDistribution(
  team1ByRole: PlayersByRole,
  team2ByRole: PlayersByRole,
  distribution: RoleDistribution,
  team2Count: number,
  usedKeys: Set<string>
): Team[] {
  const teams: Team[] = [];
  const team1Dist = distribution.team1;
  
  // Get all possible combinations of players for each role from team1
  const wkCombos = getCombinations(team1ByRole.WK, team1Dist.WK);
  const batCombos = getCombinations(team1ByRole.Batter, team1Dist.Batter);
  const arCombos = getCombinations(team1ByRole['All-Rounder'], team1Dist['All-Rounder']);
  const bowlCombos = getCombinations(team1ByRole.Bowler, team1Dist.Bowler);
  
  // Calculate how many players we need from each role from team2
  // to make a valid team with at least one of each role
  const needWK = team1Dist.WK === 0 ? 1 : 0;
  const needBat = team1Dist.Batter === 0 ? 1 : 0;
  const needAR = team1Dist['All-Rounder'] === 0 ? 1 : 0;
  const needBowl = team1Dist.Bowler === 0 ? 1 : 0;
  
  // Calculate remaining slots for team2 after filling required roles
  const remainingTeam2 = team2Count - needWK - needBat - needAR - needBowl;
  
  if (remainingTeam2 < 0) return []; // Can't satisfy requirements
  
  // Get combinations for required roles from team2
  const team2WKCombos = needWK > 0 ? getCombinations(team2ByRole.WK, needWK) : [[]];
  const team2BatCombos = needBat > 0 ? getCombinations(team2ByRole.Batter, needBat) : [[]];
  const team2ARCombos = needAR > 0 ? getCombinations(team2ByRole['All-Rounder'], needAR) : [[]];
  const team2BowlCombos = needBowl > 0 ? getCombinations(team2ByRole.Bowler, needBowl) : [[]];
  
  // Available players from team2 for remaining slots
  const availableTeam2Players = [
    ...team2ByRole.WK.filter(_ => needWK === 0),
    ...team2ByRole.Batter.filter(_ => needBat === 0),
    ...team2ByRole['All-Rounder'].filter(_ => needAR === 0),
    ...team2ByRole.Bowler.filter(_ => needBowl === 0)
  ];
  
  // Generate combinations for remaining players
  const remainingCombos = remainingTeam2 > 0 
    ? getCombinations(availableTeam2Players, remainingTeam2)
    : [[]];
  
  // Limit the number of combinations to process to avoid excessive computation
  const maxCombosPerRole = 5;
  const limitedWKCombos = wkCombos.slice(0, maxCombosPerRole);
  const limitedBatCombos = batCombos.slice(0, maxCombosPerRole);
  const limitedARCombos = arCombos.slice(0, maxCombosPerRole);
  const limitedBowlCombos = bowlCombos.slice(0, maxCombosPerRole);
  const limitedRemainingCombos = remainingCombos.slice(0, 10);
  
  // Generate teams by combining all possible combinations
  for (const wks of limitedWKCombos) {
    for (const bats of limitedBatCombos) {
      for (const ars of limitedARCombos) {
        for (const bowls of limitedBowlCombos) {
          for (const team2WKs of team2WKCombos) {
            for (const team2Bats of team2BatCombos) {
              for (const team2ARs of team2ARCombos) {
                for (const team2Bowls of team2BowlCombos) {
                  for (const remainingPlayers of limitedRemainingCombos) {
                    // Combine all selected players from both teams
                    const teamPlayers = [
                      ...wks, ...bats, ...ars, ...bowls,
                      ...team2WKs, ...team2Bats, ...team2ARs, ...team2Bowls,
                      ...remainingPlayers
                    ];
                    
                    if (teamPlayers.length !== 11) continue;
                    
                    // Check for duplicates
                    const teamKey = getTeamKey(teamPlayers);
                    if (usedKeys.has(teamKey)) continue;
                    
                    // Check if team is valid
                    if (isValidTeam(teamPlayers)) {
                      teams.push({ players: teamPlayers });
                      usedKeys.add(teamKey);
                      
                      // If we have enough teams, stop generating more
                      if (teams.length >= 5) {
                        return teams;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  return teams;
}

// Randomly select captain and vice-captain for a team
function assignCaptaincy(team: Team): Team {
  // Create a copy of the players array to avoid modifying the original
  const players = [...team.players];
  
  // Randomly select captain
  const captainIndex = Math.floor(Math.random() * players.length);
  const captain = players[captainIndex];
  
  // Remove captain from consideration for vice-captain
  players.splice(captainIndex, 1);
  
  // Randomly select vice-captain from remaining players
  const viceIndex = Math.floor(Math.random() * players.length);
  const viceCaptain = players[viceIndex];
  
  // Create updated players array with captaincy flags
  const updatedPlayers = team.players.map(player => {
    if (player === captain) {
      return { ...player, isCaptain: true };
    }
    if (player === viceCaptain) {
      return { ...player, isViceCaptain: true };
    }
    return player;
  });
  
  return { ...team, players: updatedPlayers };
}

// Main team generation function that combines the systematic and fallback approaches
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
  
  // Categorize players by role
  const team1ByRole = categorizePlayersByRole(team1Players, 'team1');
  const team2ByRole = categorizePlayersByRole(team2Players, 'team2');
  
  // Set to track unique teams
  const usedTeamKeys = new Set<string>();
  let teams: Team[] = [];
  
  // Step 1: Systematic approach - generate teams based on optimal role distributions
  try {
    const roleDistributions = generateRoleDistributions(team1ByRole, team2ByRole);
    
    // Generate teams for each distribution
    for (const distribution of roleDistributions) {
      // For each distribution, try different team sizes
      for (let team1Count = 4; team1Count <= 7; team1Count++) {
        const team2Count = 11 - team1Count;
        
        // Generate teams based on this distribution and team size
        const generatedTeams = generateTeamsFromDistribution(
          team1ByRole, 
          team2ByRole,
          distribution,
          team2Count,
          usedTeamKeys
        );
        
        // Add the generated teams
        for (const team of generatedTeams) {
          if (!usedTeamKeys.has(getTeamKey(team.players))) {
            teams.push(team);
            usedTeamKeys.add(getTeamKey(team.players));
            
            // If we have 20 teams, return them
            if (teams.length >= 20) {
              return teams;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in systematic team generation:", error);
    // If systematic approach fails, we'll fall back to the random approach
  }
  
  // Step 2: If we don't have 20 teams yet, fall back to the original random approach
  if (teams.length < 20) {
    console.log(`Systematic approach generated ${teams.length} teams. Falling back to random for the remaining ${20 - teams.length} teams.`);
    
    // Use the original random approach as a fallback
    let fallbackAttempts = 0;
    const MAX_FALLBACK_ATTEMPTS = 20000;
    
    while (teams.length < 20 && fallbackAttempts < MAX_FALLBACK_ATTEMPTS) {
      fallbackAttempts++;
      
      // Get a random composition for this team
      const team1Count = Math.floor(Math.random() * 4) + 4; // 4, 5, 6, or 7
      const team2Count = 11 - team1Count;
      
      // Try to create a valid team with the required distribution
      try {
        // Shuffle both team player arrays
        const shuffledTeam1 = [...team1Players].sort(() => Math.random() - 0.5);
        const shuffledTeam2 = [...team2Players].sort(() => Math.random() - 0.5);
        
        // Pick the required number of players from each team
        const candidateTeam = [
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
  }
  
  // If we still don't have 20 teams, throw an error
  if (teams.length < 20) {
    throw new Error('Could not generate 20 unique valid teams. Try adding more variety in player roles.');
  }
  
  // Shuffle the teams to mix systematic and random ones
  const shuffledTeams = teams.sort(() => Math.random() - 0.5);
  
  // Assign captains and vice-captains to each team
  return shuffledTeams.map(team => assignCaptaincy(team));
}