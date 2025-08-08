import { styled } from '@mui/material/styles';
import { Container, Card, Button, Paper, Box, Dialog } from '@mui/material';

// Mobile-Only Responsive Container
export const MobileResponsiveContainer = styled(Container)(({ theme }) => ({
  // Default styles (laptop/desktop unchanged)
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));

// Mobile-Only Header Section
export const MobileResponsiveHeader = styled(Box)(({ theme }) => ({
  // Default styles (laptop unchanged)
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(2),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }
}));

// Mobile-Only Search Paper
export const MobileResponsiveSearch = styled(Paper)(({ theme }) => ({
  // Default styles (laptop unchanged)
  marginTop: theme.spacing(3),
  padding: '2px 8px',
  display: 'flex',
  alignItems: 'center',
  width: 400,
  margin: `${theme.spacing(3)} auto 0`,
  borderRadius: 12,
  backgroundColor: theme.palette.action.hover,
  boxShadow: theme.shadows[1],
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    width: '100%',
    margin: `${theme.spacing(2)} 0 0`,
    borderRadius: 8,
    padding: '4px 12px',
  }
}));

// Mobile-Only Shop Card
export const MobileResponsiveCard = styled(Card)(({ theme }) => ({
  // Default styles (laptop unchanged)
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  boxShadow: theme.shadows[6],
  transition: 'transform 0.22s, box-shadow 0.22s',
  '&:hover': {
    transform: 'scale(1.018)',
    boxShadow: theme.shadows[13],
  },
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    borderRadius: 12,
    boxShadow: theme.shadows[3],
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows[6],
    },
  }
}));

// Mobile-Only Order Button
export const MobileResponsiveButton = styled(Button)(({ theme }) => ({
  // Default styles (laptop unchanged)
  fontWeight: 700,
  borderRadius: 25,
  transition: 'transform 0.18s',
  '&:active': {
    transform: 'scale(0.97)'
  },
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    borderRadius: 12,
    fontSize: '0.875rem',
  }
}));

// Mobile-Only Dialog
export const MobileResponsiveDialog = styled(Dialog)(({ theme }) => ({
  // Default styles (laptop unchanged)
  '& .MuiDialog-paper': {
    borderRadius: 12,
  },
  
  // ONLY mobile changes - full screen on mobile
  [theme.breakpoints.down('sm')]: {
    '& .MuiDialog-paper': {
      margin: 0,
      borderRadius: 0,
      maxHeight: '100vh',
      height: '100vh',
      width: '100vw',
      maxWidth: '100vw',
    }
  }
}));

// Mobile-Only No Content Paper
export const MobileResponsiveEmpty = styled(Paper)(({ theme }) => ({
  // Default styles (laptop unchanged)
  padding: theme.spacing(4),
  textAlign: 'center',
  backgroundColor: theme.palette.background.paper,
  borderRadius: 16,
  
  // ONLY mobile changes
  [theme.breakpoints.down('sm')]: {
    borderRadius: 12,
    boxShadow: theme.shadows[3],
    '&:hover': {
      transform: 'scale(1.01)',
      boxShadow: theme.shadows[6],
    },
    // Additional mobile optimizations for smaller cards
    '& .MuiCardContent-root': {
      padding: theme.spacing(1.5), // Reduced padding
    },
    '& .MuiTypography-h6': {
      fontSize: '1rem', // Smaller title
      lineHeight: 1.2,
    },
    '& .MuiTypography-body2': {
      fontSize: '0.75rem', // Smaller body text
    },
    '& .MuiTypography-subtitle2': {
      fontSize: '0.8rem', // Smaller menu title
    },
    '& .MuiList-root': {
      maxHeight: 80, // Shorter menu list
    },
    '& .MuiButton-root': {
      fontSize: '0.8rem', // Smaller button text
      padding: theme.spacing(1), // Smaller button padding
    }
  }
}));
