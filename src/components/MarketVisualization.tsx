import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { fetchJsonWithTimeout } from '@/lib/communication/fetch-with-timeout';

const COLORS = {
  price: '#2196f3',
  volume: '#4caf50',
  priceLine: 'rgba(33, 150, 243, 0.75)',
  grid: 'rgba(0, 0, 0, 0.1)',
  bullish: '#4caf50',
  bearish: '#f44336',
  neutral: '#9e9e9e',
};

interface MarketData {
  price: number;
  timestamp: string;
  volume24h: number;
  priceChange24h: number;
  sentiment: {
    bullish: number;
    bearish: number;
    neutral: number;
  };
}

const MarketVisualization: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [priceHistory, setPriceHistory] = useState<{ time: string; price: number }[]>([]);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Fetch market data with debugging logs.
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      // Using an increased timeout value of 15 seconds for debugging.
      const response = await fetchJsonWithTimeout('/api/market-data', {
        method: 'GET',
        timeout: 15000,
      });
      // Debug log to see what data is coming from the API
      console.log("Market data response:", JSON.stringify(response, null, 2));
      if (response.success) {
        setMarketData(response.data || []);
        setPriceHistory(response.priceHistory || []);
        setError(null);
      } else {
        setError(response.message || 'Failed to load market data');
        useSampleData();
      }
    } catch (err: any) {
      console.error("Error fetching market data:", err);
      setError(err.message || "Failed to fetch market data. Using sample data.");
      useSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Generate sample data when the real API data isn't available.
  const useSampleData = () => {
    const now = new Date();
    const samplePriceHistory = [];
    const basePrice = 0.001;
    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (24 - i) * 60 * 60 * 1000).toISOString();
      const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // ±10% variation
      const price = basePrice * randomFactor * (1 + i / 100);
      samplePriceHistory.push({ time, price });
    }
    setPriceHistory(samplePriceHistory);

    setMarketData([
      {
        price: samplePriceHistory[samplePriceHistory.length - 1].price,
        timestamp: now.toISOString(),
        volume24h: 1000 * Math.random(),
        priceChange24h: 5 * (Math.random() * 2 - 1), // ±5%
        sentiment: {
          bullish: 0.6,
          bearish: 0.3,
          neutral: 0.1,
        },
      },
    ]);
  };

  // Draw the price chart on the canvas.
  const drawChart = () => {
    if (!canvasRef.current || priceHistory.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions based on device pixel ratio.
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter price history based on selected time range.
    let filteredHistory = [...priceHistory];
    const now = new Date();
    if (timeRange === '1h') {
      filteredHistory = priceHistory.filter(p => new Date(p.time).getTime() > now.getTime() - 60 * 60 * 1000);
    } else if (timeRange === '4h') {
      filteredHistory = priceHistory.filter(p => new Date(p.time).getTime() > now.getTime() - 4 * 60 * 60 * 1000);
    } else if (timeRange === '24h') {
      filteredHistory = priceHistory.filter(p => new Date(p.time).getTime() > now.getTime() - 24 * 60 * 60 * 1000);
    }
    if (filteredHistory.length < 2) {
      filteredHistory = [...priceHistory];
    }
    const prices = filteredHistory.map(p => p.price);
    const minPrice = Math.min(...prices) * 0.95;
    const maxPrice = Math.max(...prices) * 1.05;
    const width = rect.width;
    const height = rect.height;
    const paddingX = 40;
    const paddingY = 20;

    // Draw grid lines for price levels.
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    const priceStep = (maxPrice - minPrice) / 5;
    for (let i = 0; i <= 5; i++) {
      const y = paddingY + (height - 2 * paddingY) * (1 - i / 5);
      ctx.beginPath();
      ctx.moveTo(paddingX, y);
      ctx.lineTo(width - paddingX, y);
      ctx.stroke();
      const price = minPrice + priceStep * i;
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(6), paddingX - 5, y + 3);
    }

    // Draw vertical grid lines and time labels along x-axis.
    const timeStep = Math.floor(filteredHistory.length / 4);
    for (let i = 0; i < filteredHistory.length; i += timeStep) {
      if (i === 0) continue;
      const x = paddingX + (width - 2 * paddingX) * (i / (filteredHistory.length - 1));
      ctx.beginPath();
      ctx.moveTo(x, paddingY);
      ctx.lineTo(x, height - paddingY);
      ctx.stroke();
      const time = new Date(filteredHistory[i].time);
      const timeLabel = time.getHours() + ':' + time.getMinutes().toString().padStart(2, '0');
      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(timeLabel, x, height - paddingY + 15);
    }

    // Draw the price line.
    ctx.strokeStyle = COLORS.priceLine;
    ctx.lineWidth = 2;
    ctx.beginPath();
    filteredHistory.forEach((point, i) => {
      const x = paddingX + (width - 2 * paddingX) * (i / (filteredHistory.length - 1));
      const y = paddingY + (height - 2 * paddingY) * (1 - (point.price - minPrice) / (maxPrice - minPrice));
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // Draw individual price points.
    filteredHistory.forEach((point, i) => {
      const x = paddingX + (width - 2 * paddingX) * (i / (filteredHistory.length - 1));
      const y = paddingY + (height - 2 * paddingY) * (1 - (point.price - minPrice) / (maxPrice - minPrice));
      ctx.fillStyle = COLORS.price;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw the current price label on the right side.
    if (filteredHistory.length > 0) {
      const latestPoint = filteredHistory[filteredHistory.length - 1];
      const x = width - paddingX;
      const y = paddingY + (height - 2 * paddingY) * (1 - (latestPoint.price - minPrice) / (maxPrice - minPrice));
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      // Use roundRect if available, or fallback to rect.
      if (ctx.roundRect) {
        ctx.roundRect(x + 5, y - 10, 65, 20, 5);
      } else {
        ctx.rect(x + 5, y - 10, 65, 20);
      }
      ctx.fill();
      ctx.fillStyle = COLORS.price;
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(latestPoint.price.toFixed(6), x + 10, y + 4);
    }
  };

  // Handle time range changes.
  const handleTimeRangeChange = (event: React.MouseEvent<HTMLElement>, newRange: string) => {
    if (newRange !== null) {
      setTimeRange(newRange);
    }
  };

  // Fetch market data on mount and auto-refresh every 10 seconds.
  useEffect(() => {
    const fetchData = async () => {
      await fetchMarketData();
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Redraw the chart when the price history or time range changes.
  useEffect(() => {
    drawChart();
  }, [priceHistory, timeRange]);

  // Redraw the chart on window resize.
  useEffect(() => {
    const handleResize = () => {
      drawChart();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [priceHistory]);

  // Format sentiment value as a percentage.
  const formatSentiment = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <Paper sx={{ p: 2, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Market Visualization
      </Typography>

      {error && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !priceHistory.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1">STORM Price Chart</Typography>
            <ToggleButtonGroup
              size="small"
              value={timeRange}
              exclusive
              onChange={handleTimeRangeChange}
              aria-label="time range"
            >
              <ToggleButton value="1h">1H</ToggleButton>
              <ToggleButton value="4h">4H</ToggleButton>
              <ToggleButton value="24h">24H</ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Box sx={{ height: 300, width: '100%', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2">Market Sentiment</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Box>
                  <Typography color={COLORS.bullish} variant="body2">
                    Bullish
                  </Typography>
                  <Typography fontWeight="bold">
                    {marketData.length ? formatSentiment(marketData[0].sentiment.bullish) : '0%'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color={COLORS.bearish} variant="body2">
                    Bearish
                  </Typography>
                  <Typography fontWeight="bold">
                    {marketData.length ? formatSentiment(marketData[0].sentiment.bearish) : '0%'}
                  </Typography>
                </Box>
                <Box>
                  <Typography color={COLORS.neutral} variant="body2">
                    Neutral
                  </Typography>
                  <Typography fontWeight="bold">
                    {marketData.length ? formatSentiment(marketData[0].sentiment.neutral) : '0%'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle2">24h Change</Typography>
              <Typography
                fontWeight="bold"
                color={
                  marketData.length && marketData[0].priceChange24h >= 0
                    ? COLORS.bullish
                    : COLORS.bearish
                }
              >
                {marketData.length ? `${marketData[0].priceChange24h.toFixed(2)}%` : '0%'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2">24h Volume</Typography>
              <Typography fontWeight="bold">
                {marketData.length ? `${marketData[0].volume24h.toFixed(2)} SOL` : '0 SOL'}
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default MarketVisualization;
