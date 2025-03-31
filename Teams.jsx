import { useState } from 'react';
import {
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Box,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Teams() {
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState('');

  const isPowerOfTwo = (n) => {
    return n && (n & (n - 1)) === 0;
  };

  const handleAddTeam = () => {
    if (!newTeamName.trim()) {
      setError('Team name cannot be empty');
      return;
    }

    if (teams.some((team) => team.name.toLowerCase() === newTeamName.toLowerCase())) {
      setError('Team name already exists');
      return;
    }

    const newTeam = {
      id: Date.now(),
      name: newTeamName.trim(),
    };

    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setError('');
  };

  const handleDeleteTeam = (teamId) => {
    setTeams(teams.filter((team) => team.id !== teamId));
  };

  const getTeamCountStatus = () => {
    if (teams.length === 0) return '';
    const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    if (isPowerOfTwo(teams.length)) {
      return `Perfect! You have ${teams.length} teams (2^${Math.log2(teams.length)}).`;
    }
    return `You need ${nextPowerOfTwo - teams.length} more team(s) to reach ${nextPowerOfTwo} teams.`;
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Team
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            fullWidth
            label="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            error={!!error}
            helperText={error}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
          />
          <Button
            variant="contained"
            onClick={handleAddTeam}
            sx={{ minWidth: '120px' }}
          >
            Add Team
          </Button>
        </Box>

        {teams.length > 0 && (
          <Alert severity={isPowerOfTwo(teams.length) ? 'success' : 'info'}>
            {getTeamCountStatus()}
          </Alert>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Registered Teams
        </Typography>
        {teams.length === 0 ? (
          <Typography color="text.secondary">
            No teams registered yet. Add your first team above.
          </Typography>
        ) : (
          <List>
            {teams.map((team) => (
              <ListItem key={team.id} divider>
                <ListItemText primary={team.name} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDeleteTeam(team.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
}

export default Teams;