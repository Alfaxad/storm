'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  AppBar, 
  Toolbar,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  CircularProgress,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import Link from 'next/link';
import AgentAvatar from '@/components/AgentAvatar';
import ChatSection from '@/components/chat/ChatSection';

interface Agent {
  id: string;
  name: string;
  personalityType: string;
  personality: string;
  occupation: string;
  publicKey: string;
  balance: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  totalPages: number;
  totalAgents: number;
}

interface Stats {
  totalAgents: number;
  successfullyFunded: number;
  failedToFund: number;
  totalFunded: number;
  personalityDistribution: Record<string, number>;
  occupationDistribution: Record<string, number>;
}

export default function AgentDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    totalPages: 0,
    totalAgents: 0
  });
  const [filter, setFilter] = useState('');
  const [personalityFilter, setPersonalityFilter] = useState('');
  
  useEffect(() => {
    loadAgents();
  }, [pagination.page, pagination.pageSize, personalityFilter]);
  
  const loadAgents = async () => {
    try {
      setLoading(true);
      
      const url = new URL('/api/agents', window.location.origin);
      url.searchParams.append('page', (pagination.page + 1).toString());
      url.searchParams.append('pageSize', pagination.pageSize.toString());
      
      if (personalityFilter) {
        url.searchParams.append('personalityType', personalityFilter);
      }
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.success) {
        setAgents(data.agents || []);
        setStats(data.stats || null);
        setPagination({
          page: data.pagination.page - 1,
          pageSize: data.pagination.pageSize,
          totalPages: data.pagination.totalPages,
          totalAgents: data.pagination.totalAgents
        });
      }
    } catch (error) {
      console.error('Error loading agents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPagination({ ...pagination, page: newPage });
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination({
      ...pagination,
      page: 0,
      pageSize: parseInt(event.target.value, 10)
    });
  };
  
  // Filter agents by search term
  const filteredAgents = agents.filter(agent => 
    filter === '' || 
    agent.name.toLowerCase().includes(filter.toLowerCase()) ||
    agent.publicKey.toLowerCase().includes(filter.toLowerCase())
  );
  
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Project Storm - Agent Dashboard
          </Typography>
          
          
          <Button component={Link} href="/" color="inherit">
            Back to Home
          </Button>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Stats Cards */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Agents
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalAgents}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Successfully Funded
                  </Typography>
                  <Typography variant="h4" component="div" color="success.main">
                    {stats.successfullyFunded}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total SOL Funded
                  </Typography>
                  <Typography variant="h4" component="div">
                    {stats.totalFunded.toFixed(2)} SOL
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Failed to Fund
                  </Typography>
                  <Typography variant="h4" component="div" color="error.main">
                    {stats.failedToFund}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
        
        {/* Personality Distribution */}
        {stats && stats.personalityDistribution && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Personality Distribution</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {Object.entries(stats.personalityDistribution).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count} (${Math.round((count / stats.totalAgents) * 100)}%)`}
                  onClick={() => setPersonalityFilter(personalityFilter === type ? '' : type)}
                  color={personalityFilter === type ? "secondary" : "default"}
                  sx={{ fontWeight: personalityFilter === type ? 'bold' : 'normal' }}
                />
              ))}
            </Box>
          </Paper>
        )}
        
        {/* Search and Filters */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search by name or public key"
                variant="outlined"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Personality Type</InputLabel>
                <Select
                  value={personalityFilter}
                  label="Personality Type"
                  onChange={(e) => setPersonalityFilter(e.target.value)}
                >
                  <MenuItem value="">All Personalities</MenuItem>
                  {stats?.personalityDistribution && 
                    Object.keys(stats.personalityDistribution).map(type => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))
                  }
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button 
                variant="contained" 
                color="primary" 
                fullWidth
                onClick={() => {
                  setFilter('');
                  setPersonalityFilter('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Agents Table */}
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Agent</TableCell>
                  <TableCell>Personality</TableCell>
                  <TableCell>Occupation</TableCell>
                  <TableCell align="right">Balance (SOL)</TableCell>
                  <TableCell>Public Key</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : filteredAgents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        No agents found matching your criteria
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAgents.map((agent) => (
                    <TableRow key={agent.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <AgentAvatar 
                            name={agent.name} 
                            personalityType={agent.personalityType} 
                            size={36} 
                          />
                          <Typography variant="body1">{agent.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={agent.personalityType} 
                          size="small" 
                          color={personalityFilter === agent.personalityType ? "secondary" : "default"}
                        />
                      </TableCell>
                      <TableCell>{agent.occupation}</TableCell>
                      <TableCell align="right">
                        <Typography 
                          fontWeight="medium"
                          color={(agent.balance || 0) > 0 ? "success.main" : "text.primary"}
                        >
                          {(agent.balance || 0).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.8rem',
                            opacity: 0.8 
                          }}
                        >
                          {agent.publicKey.substring(0, 12)}...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={pagination.totalAgents}
            rowsPerPage={pagination.pageSize}
            page={pagination.page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
      
      {/* Add Chat Section Popup */}
      <ChatSection />
    </Box>
  );
}
