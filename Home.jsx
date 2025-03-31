import { Typography, Paper, Grid, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Team Management',
      description: 'Register and manage tournament teams with ease',
      icon: <GroupsIcon sx={{ fontSize: 40 }} />,
      path: '/teams',
    },
    {
      title: 'Match Scheduling',
      description: 'Automated round-robin and knockout stage scheduling',
      icon: <EventNoteIcon sx={{ fontSize: 40 }} />,
      path: '/schedule',
    },
    {
      title: 'Tournament Bracket',
      description: 'Visual representation of tournament progress',
      icon: <EmojiEventsIcon sx={{ fontSize: 40 }} />,
      path: '/bracket',
    },
  ];

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to Tournament Scheduler
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Organize and manage your tournaments with our easy-to-use platform
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} md={4} key={feature.title}>
            <Paper
              sx={{
                p: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
              elevation={2}
            >
              <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
              <Typography variant="h5" component="h2" gutterBottom>
                {feature.title}
              </Typography>
              <Typography color="text.secondary" paragraph>
                {feature.description}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(feature.path)}
                sx={{ mt: 'auto' }}
              >
                Get Started
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Home;