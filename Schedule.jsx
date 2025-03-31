import { useState } from 'react';
import {
  Typography,
  Paper,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';

function Schedule() {
  const [activeTab, setActiveTab] = useState(0);
  const [schedule, setSchedule] = useState({ roundRobin: [], knockout: [] });
  const [error, setError] = useState('');
  const [points, setPoints] = useState({});
  const [tournamentPhase, setTournamentPhase] = useState('group'); // group, semi, final

  const generateRoundRobin = (teams) => {
    if (teams.length < 2) {
      setError('Need at least 2 teams to generate a schedule');
      return [];
    }

    const rounds = [];
    const teamCount = teams.length;
    const roundCount = teamCount - 1;
    const halfCount = teamCount / 2;

    // Create array of team indices
    const teamIndices = teams.map((_, index) => index);

    for (let round = 0; round < roundCount; round++) {
      const roundMatches = [];
      for (let match = 0; match < halfCount; match++) {
        const home = teamIndices[match];
        const away = teamIndices[teamCount - 1 - match];
        if (home !== away) {
          roundMatches.push({
            id: `R${round + 1}M${match + 1}`,
            homeTeam: teams[home].name,
            awayTeam: teams[away].name,
            round: round + 1,
            completed: false,
          });
        }
      }

      // Rotate teams (except first team)
      teamIndices.splice(1, 0, teamIndices.pop());
      rounds.push(roundMatches);
    }

    return rounds;
  };

  const generateKnockout = (teams) => {
    if (!teams.length || (teams.length & (teams.length - 1)) !== 0) {
      setError('Number of teams must be a power of 2 for knockout stage');
      return [];
    }

    const rounds = [];
    let remainingTeams = [...teams];
    let roundNumber = 1;

    while (remainingTeams.length > 1) {
      const roundMatches = [];
      for (let i = 0; i < remainingTeams.length; i += 2) {
        roundMatches.push({
          id: `K${roundNumber}M${i / 2 + 1}`,
          homeTeam: remainingTeams[i].name,
          awayTeam: remainingTeams[i + 1].name,
          round: roundNumber,
          completed: false,
        });
      }
      rounds.push(roundMatches);
      remainingTeams = remainingTeams.filter((_, index) => index % 2 === 0);
      roundNumber++;
    }

    return rounds;
  };

  const handleGenerateSchedule = () => {
    // In a real application, we would get teams from a global state or API
    const mockTeams = [
      { id: 1, name: 'Team A' },
      { id: 2, name: 'Team B' },
      { id: 3, name: 'Team C' },
      { id: 4, name: 'Team D' },
    ];

    const roundRobinSchedule = generateRoundRobin(mockTeams);
    const knockoutSchedule = generateKnockout(mockTeams);

    setSchedule({
      roundRobin: roundRobinSchedule,
      knockout: knockoutSchedule,
    });

    // Initialize points table
    const initialPoints = {};
    mockTeams.forEach(team => {
      initialPoints[team.name] = 0;
    });
    setPoints(initialPoints);
    setTournamentPhase('group');

    // Store knockout matches in localStorage for bracket visualization
    const formattedKnockoutMatches = knockoutSchedule.flat().map(match => ({
      ...match,
      position: parseInt(match.id.split('M')[1]),
      winner: null
    }));
    localStorage.setItem('tournamentMatches', JSON.stringify(formattedKnockoutMatches));
    setError('');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleWinner = (match, winner) => {
    if (tournamentPhase === 'group') {
      const updatedMatches = schedule.roundRobin.map(round =>
        round.map(m => {
          if (m.id === match.id) {
            return { ...m, completed: true, winner };
          }
          return m;
        })
      );

      // Update points
      const newPoints = { ...points };
      newPoints[winner] += 3; // 3 points for a win in group stage
      setPoints(newPoints);

      // Check if group stage is complete
      const allMatchesCompleted = updatedMatches.flat().every(m => m.completed);
      if (allMatchesCompleted) {
        // Generate semi-finals based on points
        const sortedTeams = Object.entries(newPoints)
          .sort(([,a], [,b]) => b - a)
          .map(([team]) => team);

        const semiFinals = [
          {
            id: 'SF1',
            homeTeam: sortedTeams[0],
            awayTeam: sortedTeams[3],
            round: 1,
            position: 1,
            completed: false,
            winner: null
          },
          {
            id: 'SF2',
            homeTeam: sortedTeams[1],
            awayTeam: sortedTeams[2],
            round: 1,
            position: 2,
            completed: false,
            winner: null
          }
        ];

        setSchedule(prev => ({
          ...prev,
          knockout: [semiFinals],
          roundRobin: updatedMatches
        }));
        setTournamentPhase('semi');

        // Update bracket visualization
        localStorage.setItem('tournamentMatches', JSON.stringify(semiFinals));
      } else {
        setSchedule(prev => ({ ...prev, roundRobin: updatedMatches }));
      }
    } else {
      // Handle knockout stage matches
      const updatedKnockout = schedule.knockout.map(round =>
        round.map(m => {
          if (m.id === match.id) {
            return { ...m, completed: true, winner };
          }
          return m;
        })
      );

      // Get the current match and update bracket visualization
      const currentMatch = updatedKnockout.flat().find(m => m.id === match.id);
      const storedMatches = JSON.parse(localStorage.getItem('tournamentMatches') || '[]');
      const updatedStoredMatches = storedMatches.map(m => {
        if (m.id === match.id) {
          return { ...m, completed: true, winner };
        }
        return m;
      });

      // Check if all semi-final matches are complete
      if (tournamentPhase === 'semi' && currentMatch.round === 1) {
        const allSemiFinalsComplete = updatedKnockout[0].every(m => m.completed);
        if (allSemiFinalsComplete) {
          const winners = updatedKnockout[0].map(m => m.winner);
          const final = {
            id: 'Final',
            homeTeam: winners[0],
            awayTeam: winners[1],
            round: 2,
            position: 1,
            completed: false,
            winner: null
          };

          updatedStoredMatches.push(final);
          updatedKnockout.push([final]);
          setTournamentPhase('final');
        }
      }

      localStorage.setItem('tournamentMatches', JSON.stringify(updatedStoredMatches));
      setSchedule(prev => ({ ...prev, knockout: updatedKnockout }));
    }
  };

  const renderScheduleTable = (matches) => {
    if (!matches || matches.length === 0) {
      return (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          No matches scheduled yet.
        </Typography>
      );
    }

    return (
      <Box>
        <TableContainer sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Match</TableCell>
                <TableCell>Home Team</TableCell>
                <TableCell>Away Team</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.flat().map((match) => (
                <TableRow key={match.id}>
                  <TableCell>{match.id}</TableCell>
                  <TableCell>{match.homeTeam}</TableCell>
                  <TableCell>{match.awayTeam}</TableCell>
                  <TableCell>
                    {match.completed ? `Winner: ${match.winner}` : 'Pending'}
                  </TableCell>
                  <TableCell>
                    {!match.completed && (
                      <Box>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleWinner(match, match.homeTeam)}
                          sx={{ mr: 1 }}
                        >
                          {match.homeTeam} Won
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleWinner(match, match.awayTeam)}
                        >
                          {match.awayTeam} Won
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {tournamentPhase === 'group' && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Points Table
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Team</TableCell>
                    <TableCell>Points</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(points)
                    .sort(([,a], [,b]) => b - a)
                    .map(([team, teamPoints]) => (
                      <TableRow key={team}>
                        <TableCell>{team}</TableCell>
                        <TableCell>{teamPoints}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tournament Schedule
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            variant="contained"
            onClick={handleGenerateSchedule}
            sx={{ mr: 2 }}
          >
            Generate Schedule
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Round Robin" />
            <Tab label="Knockout Stage" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {activeTab === 0
            ? renderScheduleTable(schedule.roundRobin)
            : renderScheduleTable(schedule.knockout)}
        </Box>
      </Paper>
    </Box>
  );
}

export default Schedule;