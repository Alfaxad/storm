// src/components/SimulationControls.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  IconButton,
  Typography,
  CircularProgress,
  Collapse,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Alert,
  Divider,
  Tooltip
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import RefreshIcon from '@mui/icons-material/Refresh';
import MemoryIcon from '@mui/icons-material/Memory';
import SettingsIcon from '@mui/icons-material/Settings';
import SpeedIcon from '@mui/icons-material/Speed';
import PeopleIcon from '@mui/icons-material/People';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

/**
 * SimulationControls - UI for controlling the autonomous agent simulation
 * 
 * Features:
 * - Start/pause/stop simulation
 * - Configure simulation parameters
 * - View simulation logs
 * - Monitor performance metrics
 * - Control simulation speed
 */
export default function SimulationControls({ onDataRefresh }: { onDataRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string>('STOPPED');
  const [simulationLogs, setSimulationLogs] = useState<any[]>([]);
  const [expandedLogs, setExpandedLogs] = useState(false);
  const [expandedSettings, setExpandedSettings] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  
  // Configuration state
  const [config, setConfig] = useState({
    agentCount: 50,  // Increased from 10 to 50
    maxAgentsPerPhase: 20, // Increased from 5 to 20
    phaseDuration: 60, // Reduced from 300 to 60 seconds
    personalityDistribution: {
      'CONSERVATIVE': 20,
      'MODERATE': 30, 
      'AGGRESSIVE': 20,
      'TREND_FOLLOWER': 15,
      'CONTRARIAN': 15
    }
  });
  
  // Ensure all config values have defaults to prevent NaN errors
  useEffect(() => {
    setConfig(prev => ({
      agentCount: prev.agentCount || 50,
      maxAgentsPerPhase: prev.maxAgentsPerPhase || 20,
      phaseDuration: prev.phaseDuration || 60, // Ensure this has a default
      personalityDistribution: {
        'CONSERVATIVE': prev.personalityDistribution?.CONSERVATIVE || 20,
        'MODERATE': prev.personalityDistribution?.MODERATE || 30,
        'AGGRESSIVE': prev.personalityDistribution?.AGGRESSIVE || 20,
        'TREND_FOLLOWER': prev.personalityDistribution?.TREND_FOLLOWER || 15,
        'CONTRARIAN': prev.personalityDistribution?.CONTRARIAN || 15
      }
    }));
  }, []);
  
  // Update when config changes
  const handleConfigChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update personality distribution
  const handlePersonalityChange = (personality: string, value: number) => {
    setConfig(prev => ({
      ...prev,
      personalityDistribution: {
        ...prev.personalityDistribution,
        [personality]: value
      }
    }));
  };
  
  // Normalize personality distribution to ensure it adds up to 100%
  const getNormalizedDistribution = () => {
    const distribution = config.personalityDistribution;
    const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
    
    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(distribution)) {
      normalized[key] = value / total;
    }
    
    return normalized;
  };
  
  // Get simulation status
  useEffect(() => {
    checkSimulationStatus();
    
    const interval = setInterval(() => {
      checkSimulationStatus();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Check the current simulation status
  const checkSimulationStatus = async () => {
    try {
      const response = await fetch('/api/simulation');
      if (response.ok) {
        const data = await response.json();
        setSimulationStatus(data.status || 'UNKNOWN');
        setSimulationSpeed(data.simulationSpeed || 1);
        
        // Update logs if available
        if (data.logs && Array.isArray(data.logs)) {
          setSimulationLogs(data.logs);
        }
      }
    } catch (error) {
      console.error('Error checking simulation status:', error);
      addLog('error', 'Failed to check simulation status', error);
    }
  };
  
  // Add a log entry
  const addLog = (level: string, message: string, data: any = null) => {
    setSimulationLogs(prev => [
      {
        timestamp: Date.now(),
        level,
        message,
        data
      },
      ...prev.slice(0, 99) // Keep only the most recent 100 logs
    ]);
  };
  
  // Control the simulation (start, stop, pause)
  const controlSimulation = async (action: 'start' | 'stop' | 'pause' | 'resume' | 'setSpeed') => {
    try {
      setLoading(true);
      addLog('info', `Attempting to ${action} simulation`);
      
      let requestBody: any = { action };
      
      // Add configuration for start action
      if (action === 'start') {
        requestBody.config = {
          agentCount: config.agentCount,
          maxAgentsPerPhase: config.maxAgentsPerPhase,
          phaseDuration: config.phaseDuration * 1000, // Convert to milliseconds
          personalityDistribution: getNormalizedDistribution(),
          speed: simulationSpeed
        };
      } else if (action === 'setSpeed') {
        requestBody.config = { speed: simulationSpeed };
      }
      
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.message) {
          addLog('info', data.message);
        }
        
        // Refresh simulation status and data
        await checkSimulationStatus();
        if (onDataRefresh) onDataRefresh();
      } else {
        const errorData = await response.json();
        addLog('error', `Failed to ${action} simulation: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Error during ${action} operation:`, error);
      addLog('error', `Error during ${action} operation`, error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle speed change
  const handleSpeedChange = (_event: any, newValue: number | number[]) => {
    const speed = newValue as number;
    setSimulationSpeed(speed);
  };
  
  // Apply speed change to simulation
  const applySpeedChange = () => {
    controlSimulation('setSpeed');
  };
  
  // Format log timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Get color for log level
  const getLogLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'default';
    }
  };
  
  // Get the appropriate action button based on simulation status
  const renderActionButton = () => {
    switch (simulationStatus) {
      case 'RUNNING':
        return (
          <>
            <Button
              variant="contained"
              color="warning"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PauseIcon />}
              onClick={() => controlSimulation('pause')}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Pause
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
              onClick={() => controlSimulation('stop')}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Stop
            </Button>
          </>
        );
      case 'PAUSED':
        return (
          <>
            <Button
              variant="contained"
              color="success"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
              onClick={() => controlSimulation('resume')}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Resume
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <StopIcon />}
              onClick={() => controlSimulation('stop')}
              disabled={loading}
              sx={{ mr: 1 }}
            >
              Stop
            </Button>
          </>
        );
      case 'STOPPED':
      case 'ERROR':
      default:
        return (
          <Button
            variant="contained"
            color="success"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={() => controlSimulation('start')}
            disabled={loading}
            sx={{ mr: 1 }}
          >
            Start Simulation
          </Button>
        );
    }
  };
  
  // Get status chip
  const getStatusChip = () => {
    let color: 'success' | 'warning' | 'error' | 'default' = 'default';
    
    switch (simulationStatus) {
      case 'RUNNING':
        color = 'success';
        break;
      case 'PAUSED':
        color = 'warning';
        break;
      case 'STOPPED':
      case 'ERROR':
        color = 'error';
        break;
    }
    
    return <Chip label={simulationStatus} color={color} />;
  };
  
  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      {/* Main controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Simulation Status:</Typography>
          {getStatusChip()}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {renderActionButton()}
          
          <Tooltip title="Simulation settings">
            <IconButton 
              color="primary" 
              onClick={() => setExpandedSettings(!expandedSettings)}
              sx={{ mr: 1 }}
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View logs">
            <IconButton 
              color="primary" 
              onClick={() => setExpandedLogs(!expandedLogs)}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Speed control */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Typography id="speed-slider" gutterBottom>
          Simulation Speed: {simulationSpeed}x
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SpeedIcon color="primary" />
          <Slider
            aria-labelledby="speed-slider"
            value={simulationSpeed}
            onChange={handleSpeedChange}
            onChangeCommitted={applySpeedChange}
            min={0.5}
            max={5}
            step={0.5}
            marks
            valueLabelDisplay="auto"
          />
        </Box>
      </Box>
      
      {/* Configuration settings */}
      <Collapse in={expandedSettings}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Simulation Configuration
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Number of Agents"
              type="number"
              fullWidth
              value={config.agentCount || 10}
              onChange={(e) => handleConfigChange('agentCount', parseInt(e.target.value) || 10)}
              InputProps={{ inputProps: { min: 10, max: 5000 } }}
              disabled={simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED'}
              helperText="Total agents to create (10-5000)"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Active Agents Per Phase"
              type="number"
              fullWidth
              value={config.maxAgentsPerPhase || 10}
              onChange={(e) => handleConfigChange('maxAgentsPerPhase', parseInt(e.target.value) || 10)}
              InputProps={{ inputProps: { min: 10, max: 1000 } }}
              disabled={simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED'}
              helperText="Agents processed per phase (10-1000)"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Phase Duration (seconds)"
              type="number"
              fullWidth
              value={config.phaseDuration || 60}
              onChange={(e) => handleConfigChange('phaseDuration', parseInt(e.target.value) || 60)}
              InputProps={{ inputProps: { min: 5, max: 120 } }}
              disabled={simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED'}
              helperText="Time per simulation phase (5-120 seconds)"
            />
          </Grid>
        </Grid>
        
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
          Agent Personality Distribution
        </Typography>
        
        <Grid container spacing={2}>
          {Object.entries(config.personalityDistribution).map(([personality, value]) => (
            <Grid item xs={12} sm={6} md={2.4} key={personality}>
              <Typography gutterBottom>
                {personality.charAt(0) + personality.slice(1).toLowerCase()}: {value}%
              </Typography>
              <Slider
                value={value}
                onChange={(_e, newValue) => handlePersonalityChange(personality, newValue as number)}
                aria-labelledby={`${personality}-slider`}
                min={0}
                max={100}
                disabled={simulationStatus === 'RUNNING' || simulationStatus === 'PAUSED'}
              />
            </Grid>
          ))}
        </Grid>
      </Collapse>
      
      {/* Logs */}
      <Collapse in={expandedLogs}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Simulation Logs
        </Typography>
        
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {simulationLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">No logs available</TableCell>
                </TableRow>
              ) : (
                simulationLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={log.level.toUpperCase()} 
                        size="small"
                        color={getLogLevelColor(log.level)}
                      />
                    </TableCell>
                    <TableCell>{log.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Paper>
  );
}
