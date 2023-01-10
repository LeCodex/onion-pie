// import logo from './logo.svg';
import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import useMediaQuery from '@mui/material/useMediaQuery';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { SocketContext, socket } from "./components/context/socket"
import ClientComponent from './components/ClientComponent';
import WarningSnackbar from './components/WarningSnackbar';


export default function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          white: {
            main: '#ffffff',
            contrastText: '#000',
          }
        },
        typography: {
          h1: { fontFamily: "ClashDisplay-Medium" },
          h2: { fontFamily: "ClashDisplay-Medium" },
          h3: { fontFamily: "ClashDisplay-Medium" },
          h4: { fontFamily: "ClashDisplay-Medium" },
          h5: { fontFamily: "ClashDisplay-Medium" },
          h6: { fontFamily: "ClashDisplay-Medium" },
          body1: { fontFamily: "ClashDisplay-Regular" },
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <SocketContext.Provider value={socket}>
        <ClientComponent/>
        <WarningSnackbar />
      </SocketContext.Provider>
    </ThemeProvider>
  );
}
