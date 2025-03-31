import { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Alert,
  Button,
} from '@mui/material';

function Bracket() {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    // Initialize matches from localStorage if available
    const storedMatches = localStorage.getItem('tournamentMatches');
    if (storedMatches) {
      setMatches(JSON.parse(storedMatches));
    }
  }, []);

  const handleWinnerSelect = (round, position, team) => {
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(m => {
        if (m.round === round && m.position === position) {
          return { ...m, winner: team, completed: true };
        }
        return m;
      });
      
      // Check if all matches in current round are complete
      const currentRoundMatches = updatedMatches.filter(m => m.round === round);
      const allCurrentRoundComplete = currentRoundMatches.every(m => m.completed);
      
      if (allCurrentRoundComplete) {
        // For semi-finals, create the final match
        if (round === 1) {
          const winners = currentRoundMatches.map(m => m.winner);
          const finalMatch = {
            id: 'Final',
            round: 2,
            position: 1,
            homeTeam: winners[0],
            awayTeam: winners[1],
            completed: false,
            winner: null
          };
          updatedMatches.push(finalMatch);
        }
      }

      // Update next round match if applicable
      const currentMatch = updatedMatches.find(m => m.round === round && m.position === position);
      if (currentMatch && currentMatch.winner) {
        const nextRoundPosition = Math.ceil(position / 2);
        const nextRoundMatch = updatedMatches.find(m => m.round === round + 1 && m.position === nextRoundPosition);
        
        if (nextRoundMatch) {
          const isFirstMatchOfPair = position % 2 !== 0;
          if (isFirstMatchOfPair) {
            nextRoundMatch.homeTeam = currentMatch.winner;
          } else {
            nextRoundMatch.awayTeam = currentMatch.winner;
          }
        }
      }

      // Store updated matches in localStorage
      localStorage.setItem('tournamentMatches', JSON.stringify(updatedMatches));
      return updatedMatches;
    });
  }; // Added missing closing brace



  const handleReset = () => {
    setMatches([]);
    localStorage.removeItem('tournamentMatches');
  };


  const renderMatch = (match) => (
    <Paper
      key={`${match.round}-${match.position}`}
      sx={{
        p: 1,
        width: '200px',
        mb: 2,
        backgroundColor: match.winner ? '#e3f2fd' : '#fff',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          right: '-40px',
          top: '50%',
          width: '40px',
          height: '2px',
          backgroundColor: '#ccc',
          display: match.round < rounds.length ? 'block' : 'none',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: '-40px',
          top: '50%',
          width: '40px',
          height: '2px',
          backgroundColor: '#ccc',
          display: match.round > 1 ? 'block' : 'none',
        },
      }}
    >
      <Box 
        sx={{ 
          borderBottom: '1px solid #eee', 
          pb: 0.5, 
          mb: 0.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => handleWinnerSelect(match.round, match.position, match.homeTeam)}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: match.winner === match.homeTeam ? 'bold' : 'normal',
            color: match.winner === match.homeTeam ? 'primary.main' : 'text.primary',
            cursor: 'pointer'
          }}
        >
          {match.homeTeam}
        </Typography>
      </Box>
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => handleWinnerSelect(match.round, match.position, match.awayTeam)}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: match.winner === match.awayTeam ? 'bold' : 'normal',
            color: match.winner === match.awayTeam ? 'primary.main' : 'text.primary',
            cursor: 'pointer'
          }}
        >
          {match.awayTeam}
        </Typography>
      </Box>
    </Paper>
  );

  const renderRound = (roundNumber) => {
    const roundMatches = matches.filter((match) => match.round === roundNumber);
    return (
      <Box
        key={roundNumber}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          mr: 4,
          height: `${Math.pow(2, roundNumber) * 100}px`,
        }}
      >
        {roundMatches.map(renderMatch)}
      </Box>
    );
  };


  const rounds = Array.from(
    new Set(matches.map((match) => match.round))
  ).sort((a, b) => a - b);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Tournament Bracket
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
        >
          Reset Tournament
        </Button>
      </Box>

      {matches.length === 0 ? (
        <Alert severity="info">
          No tournament matches available. Please generate the schedule first.
        </Alert>
      ) : (
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            p: 3,
            backgroundColor: '#f5f5f5',
            borderRadius: 1,
          }}
        >
          {rounds.map(renderRound)}
        </Box>
      )}
    </Box>
  );
}

export default Bracket;