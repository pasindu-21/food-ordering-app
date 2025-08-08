import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Mobile-Only Detection Hook
export const useMobileOnly = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallMobile = useMediaQuery('(max-width:480px)');
  
  return {
    isMobile,
    isVerySmallMobile,
    theme,
    
    // Mobile-only responsive values
    mobileGridSpacing: isMobile ? 2 : 4, // laptop එකේ 4, mobile එකේ 2
    mobileCardHeight: isMobile ? 140 : 150, // laptop එකේ 150, mobile එකේ 140
    mobilePadding: isMobile ? 2 : 3, // laptop එකේ 3, mobile එකේ 2
    mobileTextSize: isMobile ? 'h5' : 'h4', // laptop එකේ h4, mobile එකේ h5
    mobileIconSize: isMobile ? 'medium' : 'large', // laptop එකේ large, mobile එකේ medium
  };
};

// Mobile-Only Typography Helper
export const getMobileTextSize = (isMobile) => {
  return {
    title: isMobile ? { fontSize: '1.5rem' } : {}, // laptop එකේ default, mobile එකේ 1.5rem
    subtitle: isMobile ? { fontSize: '0.875rem' } : {}, // laptop එකේ default, mobile එකේ 0.875rem
    body: isMobile ? { fontSize: '0.8rem' } : {}, // laptop එකේ default, mobile එකේ 0.8rem
  };
};

// Mobile-Only Dialog Props
export const getMobileDialogProps = (isMobile) => {
  return {
    fullScreen: isMobile, // laptop එකේ normal dialog, mobile එකේ full screen
    maxWidth: isMobile ? false : 'sm',
    PaperProps: {
      sx: {
        borderRadius: isMobile ? 0 : 3,
        margin: isMobile ? 0 : 2
      }
    }
  };
};
export const useMobileGridLayout = () => {
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isVerySmallMobile = useMediaQuery('(max-width:480px)');
  
  return {
    isMobile,
    isVerySmallMobile,
    
    // Grid props for shops - 2 per row on all mobile sizes
    shopGridProps: {
      xs: 6,  // 2 shops per row on mobile
      sm: 6,  // 2 shops per row on tablet  
      md: 4   // 3 shops per row on desktop
    },
    
    // Responsive card height for mobile 2-column layout
    mobileCardHeight: isVerySmallMobile ? 120 : isMobile ? 130 : 150,
    
    // Responsive spacing for tighter mobile layout
    mobileSpacing: isVerySmallMobile ? 1 : isMobile ? 1.5 : 4,
  };
};