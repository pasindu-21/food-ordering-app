// src/context/ColorModeContext.js

import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ColorModeContext = createContext();

export function useColorMode() {
  return useContext(ColorModeContext);
}

export default function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(
    localStorage.getItem("colorMode") || "light"
  );

  const toggleColorMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("colorMode", next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#131313",
                  paper: "#232323",
                },
                primary: {
                  main: "#90caf9",
                },
              }
            : {
                background: {
                  default: "#f4f6f8",
                  paper: "#fff",
                },
                primary: {
                  main: "#1976d2",
                },
              }),
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                transition: "background .2s",
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
