// src/app/monitoring/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatSection from '@/components/chat/ChatSection';
import dynamic from 'next/dynamic';
import AMMVisualization from '@/components/AMMVisualization';
import MarketVisualization from '@/components/MarketVisualization';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import Link from 'next/link';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  People as PeopleIcon,
  SwapHoriz as SwapHorizIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

// Dynamically import heavy components with no SSR
const SimulationControls = dynamic(
  () => import('@/components/SimulationControls'),
  { ssr: false, loading: () => <div>Loading controls...</div> }
);

// Types
interface Transaction {
  id: string;
  type: string;
  amount: number;
  price: number;
  priceImpact: number;
  timestamp: number;
  agentId?: string;
  agent?: {
    displayName: string;
    personalityType: string;
    avatarUrl: string;
  }
}

interface SimulationStatus {
  status: string;
  currentPhase: string;
  phaseProgress: number;
  agentCount: number;
  activeAgentCount: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
    warning: boolean;
  };
  market?: {
    price: number;
    solReserve: number;
    tokenReserve: number;
    volume24h: number;
    high24h: number;
    low24h: number;
    operationCount: number;
    successRate: number;
  };
  agents?: {
    totalAgents: number;
    activeAgents: number;
  };
  simulationSpeed: number;
  timestamp: number;
}

/**
 * MonitoringPage - Main dashboard for simulation monitoring and control
 * 
 * Shows:
 * - Real-time simulation status
 * - Market statistics 
 * - Agent activity metrics
 * - Recent trades
 * - System performance indicators
 */
export default function MonitoringPage() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [simulationStatus, setSimulationStatus] = useState<SimulationStatus | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(3000); // 3 seconds
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Format a number with commas and fixed decimals
  const formatNumber = (num: number | undefined | null, decimals: number = 2): string => {
    if (num === undefined || num === null) return '0.00';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Format timestamp
  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };
  
  // Determine color based on sentiment/direction
  const getDirectionColor = (value: number): string => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };
  
  // Load data function
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get simulation status first
      const statusResponse = await fetch('/api/simulation');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSimulationStatus(statusData);
      }
      
      // Get recent trades
      const tradesResponse = await fetch('/api/transactions?limit=10');
      if (tradesResponse.ok) {
        const tradesData = await tradesResponse.json();
        if (tradesData.success) {
          setTransactions(tradesData.transactions || []);
        }
      }
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Auto-refresh setup
  useEffect(() => {
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(loadData, refreshRate);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, refreshRate, loadData]);
  
  // Show different status based on simulation state
  const getStatusChip = () => {
    if (!simulationStatus) return <Chip label="Unknown" color="default" />;
    
    switch (simulationStatus.status) {
      case 'RUNNING':
        return <Chip label="Running" color="success" />;
      case 'PAUSED':
        return <Chip label="Paused" color="warning" />;
      case 'STOPPED':
        return <Chip label="Stopped" color="error" />;
      case 'ERROR':
        return <Chip label="Error" color="error" />;
      default:
        return <Chip label={simulationStatus.status} color="default" />;
    }
  };
  
  // Get phase display
  const getPhaseDisplay = () => {
    if (!simulationStatus) return null;
    
    let phaseLabel = simulationStatus.currentPhase;
    if (phaseLabel) {
      phaseLabel = phaseLabel.replace(/_/g, ' ');
      // Title case
      phaseLabel = phaseLabel.toLowerCase().split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Current Phase
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{phaseLabel}</Typography>
          <LinearProgress 
            variant="determinate" 
            value={simulationStatus.phaseProgress} 
            sx={{ flex: 1, minWidth: 100 }}
          />
          <Typography variant="body2">
            {simulationStatus.phaseProgress}%
          </Typography>
        </Box>
      </Box>
    );
  };
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project Storm - Simulation Monitoring
          </Typography>
          
          <FormControlLabel
            control={
              <Switch 
                checked={autoRefresh} 
                onChange={() => setAutoRefresh(!autoRefresh)}
                color="primary" 
              />
            }
            label="Auto-refresh"
          />
          
          
          <Button 
            component={Link} 
            href="/agent-dashboard" 
            color="secondary" 
            variant="outlined"
            sx={{ mr: 2 }}
          >
            Agent Dashboard
          </Button>
          
          <Button component={Link} href="/" color="inherit">
            Back to Home
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Simulation Controls */}
        <SimulationControls onDataRefresh={loadData} />
        
        {loading && <LinearProgress sx={{ mb: 2 }} />}
        
        {/* Market Visualization */}
        <MarketVisualization />
        
        {/* AMM Visualization */}
        <AMMVisualization />
        
        {/* Status section */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6">Simulation Status:</Typography>
                {getStatusChip()}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              {getPhaseDisplay()}
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SpeedIcon />
                <Typography>
                  Speed: {simulationStatus?.simulationSpeed || 1}x
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <ScheduleIcon />
                <Typography variant="body2" color="text.secondary">
                  Last update: {lastUpdate?.toLocaleTimeString() || 'Never'}
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Memory Usage
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={simulationStatus?.memoryUsage?.percentage || 0} 
                  color={simulationStatus?.memoryUsage?.warning ? "error" : "primary"}
                />
                <Typography variant="body2">
                  {simulationStatus?.memoryUsage?.used || 0} MB / {simulationStatus?.memoryUsage?.total || 0} MB
                  ({simulationStatus?.memoryUsage?.percentage || 0}%)
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* System warnings */}
        {simulationStatus?.memoryUsage?.warning && (
          <Alert severity="warning" sx={{ mb: 4 }}>
            High memory usage detected. Consider reducing the number of active agents or closing unused applications.
          </Alert>
        )}
        
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Agents Card */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Agents
                  </Typography>
                  <PeopleIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {simulationStatus?.activeAgentCount || 0} / {simulationStatus?.agentCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active / Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Token Price Card */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" gutterBottom>
                    STORM Token Price
                  </Typography>
                  {simulationStatus?.market?.price && simulationStatus.market.price > 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(simulationStatus?.market?.price || 0, 8)} SOL
                </Typography>
                <Typography variant="body2">
                  24h: <span style={{ color: 'green' }}>High {formatNumber(simulationStatus?.market?.high24h || 0, 8)}</span> / <span style={{ color: 'red' }}>Low {formatNumber(simulationStatus?.market?.low24h || 0, 8)}</span>
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Volume Card */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" gutterBottom>
                    24h Trading Volume
                  </Typography>
                  <SwapHorizIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(simulationStatus?.market?.volume24h || 0)} SOL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {simulationStatus?.market?.operationCount || 0} trades ({(simulationStatus?.market?.successRate || 0) * 100}% success)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Liquidity Card */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary" gutterBottom>
                    Liquidity Pool
                  </Typography>
                  <MemoryIcon color="primary" />
                </Box>
                <Typography variant="h4" component="div">
                  {formatNumber(simulationStatus?.market?.solReserve || 0)} SOL
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatNumber(simulationStatus?.market?.tokenReserve || 0)} STORM
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Recent Transactions */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Recent Transactions
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Agent</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Price Impact</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No transactions yet
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>{formatTime(tx.timestamp)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={tx.type === 'buy' ? 'BUY' : 'SELL'} 
                          color={tx.type === 'buy' ? 'success' : 'error'} 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {tx.agent ? tx.agent.displayName : 'System'}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(tx.amount)} {tx.type === 'buy' ? 'SOL' : 'STORM'}
                      </TableCell>
                      <TableCell align="right">
                        {formatNumber(tx.price, 8)} SOL
                      </TableCell>
                      <TableCell align="right" sx={{ color: getDirectionColor(tx.priceImpact) }}>
                        {(tx.priceImpact * 100).toFixed(4)}%
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" size="small" onClick={loadData}>
              Refresh Transactions
            </Button>
          </Box>
        </Paper>
      </Container>
      
      {/* Chat Section */}
      <ChatSection />
    </Box>
  );
}