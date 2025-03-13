import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { fetchJsonWithTimeout } from '@/lib/communication/fetch-with-timeout';

interface AmmData {
  solAmount: number;
  tokenAmount: number;
  currentPrice: number;
  tradingVolume: number;
  tradingVolume24h: number;
  lastTradedAt: string | null;
}

interface Transaction {
  signature: string;
  amount: number;
  tokenAmount?: number;
  confirmedAt?: string;
}

const AMMVisualization: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [ammData, setAmmData] = useState<AmmData>({
    solAmount: 0,
    tokenAmount: 0,
    currentPrice: 0,
    tradingVolume: 0,
    tradingVolume24h: 0,
    lastTradedAt: null,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch AMM data with debugging output.
  const fetchAmmData = async () => {
    try {
      setLoading(true);
      const response = await fetchJsonWithTimeout('/api/amm-stats', { timeout: 15000 });
      // Debug log to inspect incoming AMM data
      console.log("AMM stats response:", JSON.stringify(response, null, 2));
      if (response.success) {
        const data = response.data;
        setAmmData({
          solAmount: data.solAmount || 0,
          tokenAmount: data.tokenAmount || 0,
          currentPrice: data.currentPrice || 0,
          tradingVolume: data.tradingVolume || 0,
          tradingVolume24h: data.tradingVolume24h || 0,
          lastTradedAt: data.lastTradedAt || null,
        });
        setTransactions(response.transactions || []);
        setError(null);
      } else {
        setError(response.message || 'Failed to load AMM data');
      }
    } catch (err: any) {
      console.error("Error fetching AMM data:", err);
      setError(err.message || "Failed to fetch AMM data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch AMM data on component mount and refresh every 10 seconds.
  useEffect(() => {
    fetchAmmData();
    const interval = setInterval(fetchAmmData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        AMM Visualization
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box>
            <Typography variant="subtitle1">Pool Statistics</Typography>
            <Divider sx={{ my: 1 }} />
            <Box>
              <Typography>
                <strong>SOL Amount:</strong> {ammData.solAmount}
              </Typography>
              <Typography>
                <strong>Token Amount:</strong> {ammData.tokenAmount}
              </Typography>
              <Typography>
                <strong>Current Price:</strong> {ammData.currentPrice}
              </Typography>
              <Typography>
                <strong>Trading Volume:</strong> {ammData.tradingVolume}
              </Typography>
              <Typography>
                <strong>24h Trading Volume:</strong> {ammData.tradingVolume24h}
              </Typography>
              <Typography>
                <strong>Last Traded At:</strong>{" "}
                {ammData.lastTradedAt
                  ? new Date(ammData.lastTradedAt).toLocaleString()
                  : "N/A"}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1">Recent Transactions</Typography>
            {transactions.length === 0 ? (
              <Typography>No recent transactions</Typography>
            ) : (
              transactions.map((txn, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    Signature: {txn.signature} - Amount: {txn.amount} - Confirmed At:{" "}
                    {txn.confirmedAt ? new Date(txn.confirmedAt).toLocaleString() : "N/A"}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AMMVisualization;
