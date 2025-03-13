import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  Avatar,
  Fab,
  Divider,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  Tooltip
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import AgentAvatar from '../AgentAvatar';
import { fetchJsonWithTimeout } from '@/lib/communication/fetch-with-timeout';

interface Message {
  id: string;
  content: string;
  sentiment: string | null;
  type: string;
  sender: {
    id: string;
    name: string;
    personalityType: string;
  };
  createdAt: string;
}

export default function ChatSection() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [agentGenerating, setAgentGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);
  
  // Load messages when drawer opens
  useEffect(() => {
    if (open) {
      loadMessages();
    }
  }, [open]);
  
  // Load messages from API
  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await fetchJsonWithTimeout('/api/messages?count=50', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate message from random agent
  const generateMessage = async () => {
    try {
      setAgentGenerating(true);
      
      // Generate message from a random agent
      const response = await fetchJsonWithTimeout('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          count: 1 // Generate 1 message
        })
      });
      
      if (response.messages && response.messages.length > 0) {
        setMessages(prevMessages => [
          ...prevMessages,
          response.messages[0]
        ]);
      }
    } catch (error) {
      console.error('Error generating message:', error);
    } finally {
      setAgentGenerating(false);
    }
  };
  
  // Helper to format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper to get color based on sentiment
  const getSentimentColor = (sentiment: string | null) => {
    if (!sentiment) return 'default';
    
    switch (sentiment.toLowerCase()) {
      case 'positive':
        return 'success';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <>
      {/* Chat button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(true)}
        sx={{ position: 'fixed', bottom: 20, right: 20 }}
      >
        <ChatBubbleOutlineIcon />
      </Fab>
      
      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          width: 400,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 400,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}>
            <Typography variant="h6">Agent Chat</Typography>
            <Box>
              <IconButton onClick={loadMessages} disabled={loading} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              <IconButton onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          {/* Messages */}
          <Box sx={{ 
            flexGrow: 1, 
            overflow: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: '#f5f5f5'
          }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                height: '100%',
                opacity: 0.7
              }}>
                <Typography>No messages yet</Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Box key={message.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <AgentAvatar 
                    name={message.sender?.name || "Unknown"} 
                    personalityType={message.sender?.personalityType || "MODERATE"}
                    size={40}
                  />
                  <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 'calc(100% - 50px)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {message.sender?.name || "Unknown Agent"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(message.createdAt)}
                      </Typography>
                    </Box>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        bgcolor: 'white',
                        borderRadius: '0 16px 16px 16px',
                        borderLeft: `3px solid ${getSentimentColor(message.sentiment)}`,
                      }}
                    >
                      <Typography variant="body2">{message.content}</Typography>
                    </Paper>
                  </Box>
                </Box>
              ))
            )}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Auto-updating message section info */}
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider', 
            display: 'flex',
            justifyContent: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              Messages will appear automatically as agents interact during the simulation
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}