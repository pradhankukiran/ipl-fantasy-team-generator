export type PlayerRole = 'WK' | 'Batter' | 'All-Rounder' | 'Bowler';
export type TeamOrigin = 'team1' | 'team2';

export interface Player {
  name: string;
  role: PlayerRole;
  originalTeam?: TeamOrigin;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
}

export interface TeamInfo {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface Team {
  players: Player[];
  teamInfo?: TeamInfo;
}

export interface TeamData {
  team1: Team;
  team2: Team;
}