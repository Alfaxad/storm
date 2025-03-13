// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  AppBar,
  Toolbar,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';

export default function Home() {
  // Use client-side state for any dynamic content
  const [mounted, setMounted] = useState(false);
  
  // Only render dynamic content after mounting on client
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      sx={{ 
        minHeight: '100vh',
        backgroundColor: 'background.default',
      }}
    >
      {/* Navigation */}
      <AppBar
        position="static"
        color="transparent"
        elevation={0}
        sx={{ py: 1 }}
      >
        <Container>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              Project Storm
            </Typography>

            <Box sx={{ display: 'flex', gap: 3 }}>
              <MuiLink
                component={Link}
                href="/agent-dashboard"
                underline="none"
                color="inherit"
              >
                Dashboard
              </MuiLink>
            </Box>

            <Button
              variant="contained"
              color="primary"
              component={Link}
              href="/monitoring"
            >
              View Simulation
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ py: 12 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={7}>
            <Typography
              variant="h1"
              fontWeight="bold"
              gutterBottom
              sx={{
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '0',
                  width: '120px',
                  height: '4px',
                  backgroundColor: 'secondary.main',
                },
              }}
            >
              Simulated Trading
              <Box
                component="span"
                sx={{ textDecoration: 'underline', ml: 1 }}
              >
                Operations
              </Box>
            </Typography>

            <Typography variant="h1" fontWeight="bold">
              by Responsive
            </Typography>

            <Typography variant="h1" fontWeight="bold" sx={{ mb: 4 }}>
              Multi-agents
            </Typography>

            <Typography variant="h5" color="text.secondary" paragraph>
              {mounted ? (
                `Thousands of AI agents with unique personalities, trading strategies,
                and communication styles interacting in a simulated Solana environment.`
              ) : (
                'Loading...'
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: 'relative',
                height: '400px',
                width: '100%',
                background: 'url(/network-hex.svg) no-repeat center center',
                backgroundSize: 'contain',
              }}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Cards Section */}
      <Container sx={{ py: 8 }}>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  AGENT DASHBOARD
                </Typography>
                <Typography variant="h4" component="div" gutterBottom>
                  Monitor All Agents
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View all simulated traders, their personalities, balances, and activity in a comprehensive dashboard.
                  Track the performance of different personality types and trading strategies.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  component={Link}
                  href="/agent-dashboard"
                  variant="outlined"
                  fullWidth
                >
                  Open Dashboard
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  SIMULATION MONITORING
                </Typography>
                <Typography variant="h4" component="div" gutterBottom>
                  Monitor Simulation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Track the simulation metrics, view transaction history, and control the autonomous behavior of your trading agents.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  component={Link}
                  href="/monitoring"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  View Monitoring
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary">
                  AGENT COMMUNICATIONS
                </Typography>
                <Typography variant="h4" component="div" gutterBottom>
                  Real-time Chat
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Observe how agents interact, share trading ideas, and influence each other in real-time.
                  See how market sentiment forms and evolves through agent interactions on both the
                  monitoring page and agent dashboard.
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 2 }}>
                <Button
                  component={Link}
                  href="/monitoring"
                  variant="contained"
                  color="secondary"
                  fullWidth
                >
                  View Chat
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
