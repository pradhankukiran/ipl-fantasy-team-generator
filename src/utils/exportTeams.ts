import { Team } from '../types';

export function downloadAsJSON(teams: Team[]) {
  const dataStr = JSON.stringify(teams, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fantasy-teams.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadAsCSV(teams: Team[]) {
  const headers = ['Team Number', 'Player Name', 'Role'];
  const rows = teams.flatMap((team, teamIndex) =>
    team.players.map(player => [
      `Team ${teamIndex + 1}`,
      player.name,
      player.role
    ])
  );
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const dataBlob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'fantasy-teams.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}