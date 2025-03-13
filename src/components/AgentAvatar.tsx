import { Avatar, Box } from '@mui/material';

interface AgentAvatarProps {
  name: string;
  personalityType: string;
  size?: number;
}

// Function to get color based on personality type
const getPersonalityColor = (personalityType: string): string => {
  const colors: Record<string, string> = {
    CONSERVATIVE: '#4299E1', // blue
    AGGRESSIVE: '#E53E3E',   // red
    TECHNICAL: '#805AD5',    // purple
    FUNDAMENTAL: '#38A169',  // green
    EMOTIONAL: '#ED64A6',    // pink
    CONTRARIAN: '#ECC94B',   // yellow
    WHALE: '#667EEA',        // indigo
    NOVICE: '#A0AEC0'        // gray
  };
  
  return colors[personalityType] || '#A0AEC0';
};

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default function AgentAvatar({ name, personalityType, size = 40 }: AgentAvatarProps) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: getPersonalityColor(personalityType),
        fontSize: size * 0.4,
        fontWeight: 'bold'
      }}
    >
      {getInitials(name)}
    </Avatar>
  );
}
