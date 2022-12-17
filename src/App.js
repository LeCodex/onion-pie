// import logo from './logo.svg';
import * as React from 'react';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import io from 'socket.io-client';
import ClientComponent from './socket/client';

const socket = io();

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Button variant="contained" color="secondary">Hello World</Button>
          <ClientComponent />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
