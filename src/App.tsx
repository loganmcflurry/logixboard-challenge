import { createTheme, ThemeProvider } from '@material-ui/core';
import { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';

import './App.css';
import { Navbar } from './components/Navbar';
import {
  FetchShipmentsResult,
  fetchShipments,
  LoadingResult,
} from './data/fetch-shipments';
import { DashboardPage } from './pages/DashboardPage';
import { ShipmentsPage } from './pages/ShipmentsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2AC3AD',
    },
  },
});

const INITIAL_RESULT: LoadingResult = {
  status: 'LOADING',
};

export const App = () => {
  // fetch data when the app loads
  const [fetchShipmentsResult, setFetchShipmentsResult] = useState<
    FetchShipmentsResult | LoadingResult
  >(INITIAL_RESULT);
  useEffect(() => {
    fetchShipments().then((result) => setFetchShipmentsResult(result));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Navbar />
        <Switch>
          <Route exact path="/">
            <Redirect to="/dashboard" />
          </Route>
          <Route path="/dashboard">
            <DashboardPage data={fetchShipmentsResult} />
          </Route>
          <Route path="/shipments">
            <ShipmentsPage data={fetchShipmentsResult} />
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};
