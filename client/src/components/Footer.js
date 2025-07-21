import React from 'react';
import { Box, Link, Typography, IconButton, Stack, Divider, Slide } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';

const FooterBar = styled(Box)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(8),
  padding: theme.spacing(3, 2),
  background: theme.palette.mode === 'dark'
    ? 'linear-gradient(90deg, #181c23 0%, #232632 100%)'
    : 'linear-gradient(90deg, #ecf0f3 0%, #fafafa 100%)',
  textAlign: 'center',
  borderTop: `1.5px solid ${theme.palette.divider}`,
  color: theme.palette.text.secondary,
  fontSize: '1.06rem',
  boxShadow: "0 -8px 32px 0 rgba(60,80,120,0.07)",
  position: "relative"
}));

const SOCIALS = [
  {
    href: "https://github.com/",
    icon: <GitHubIcon fontSize="medium" />,
    label: "GitHub",
    color: "#181717"
  },
  {
    href: "https://facebook.com/",
    icon: <FacebookIcon fontSize="medium" />,
    label: "Facebook",
    color: "#1877F3"
  },
  {
    href: "https://instagram.com/",
    icon: <InstagramIcon fontSize="medium" />,
    label: "Instagram",
    color: "#E1306C"
  }
];

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/contact", label: "Contact" }
];

const Footer = () => {
  const theme = useTheme();

  return (
    <Slide direction="up" in={true} mountOnEnter unmountOnExit timeout={700}>
      <FooterBar role="contentinfo">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary'}}>
            &copy; {new Date().getFullYear()}{" "}
            <b style={{ color: theme.palette.primary.main }}>FoodHub</b> &middot; All Rights Reserved
          </Typography>
          <Stack direction="row" spacing={1}>
            {SOCIALS.map(({ href, icon, label, color }) => (
              <IconButton
                key={label}
                href={href}
                sx={{
                  color: color,
                  opacity: 0.7,
                  transition: "transform 0.2s, opacity 0.2s",
                  "&:hover": {
                    transform: "scale(1.12)",
                    opacity: 1,
                    color: theme.palette.primary.main
                  }
                }}
                aria-label={`Visit our ${label}`}
                title={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {icon}
              </IconButton>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ mb: 1, mt: 0.5, opacity: 0.4 }} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{
            mt: 1,
            mb: 1,
            flexWrap: 'wrap'
          }}
        >
          {LINKS.map(({ href, label }) => (
            <Link
              key={label}
              href={href}
              color="inherit"
              underline="hover"
              sx={{
                opacity: 0.8,
                fontSize: 14,
                "&:hover": {
                  color: theme.palette.primary.main,
                  opacity: 1
                }
              }}
            >
              {label}
            </Link>
          ))}
        </Stack>
        <Typography variant="caption" sx={{ color: "text.secondary", opacity: 0.8 }}>
          Built with&nbsp;
          <Link
            href="https://mui.com/"
            target="_blank"
            rel="noopener"
            underline="hover"
            sx={{ color: "primary.main", fontWeight: 700 }}
          >
            Material-UI
          </Link>
        </Typography>
      </FooterBar>
    </Slide>
  );
};

export default Footer;
