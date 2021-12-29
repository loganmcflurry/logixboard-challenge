import { ReactElement } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  makeStyles,
  useTheme,
} from '@material-ui/core';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import Loader from 'react-loader-spinner';
import { FetchShipmentsResult, LoadingResult } from '../data/fetch-shipments';
import { Shipment } from '../data/Shipment';
import { format } from 'date-fns';

/**
 * Number of days to preview on the dashboard
 */
const NUM_DAYS_PREVIEW: number = 7;

/**
 * Columns to show in slimmed-down preview table
 */
const COLUMNS: GridColDef[] = [
  {
    field: 'houseBillNumber',
    headerName: 'House Bill',
    width: 200,
  },
  {
    field: 'status',
    headerName: 'Status',
    width: 200,
  },
];

/**
 * styles
 */
const useStyles = makeStyles({
  grid: {
    width: '100%',
    padding: '10px 20px',
  },
  card: {
    width: '100%',
    height: '100%',
    '& > hr': {
      margin: '0px 20px',
    },
  },
  table: {
    width: '100%',
    height: '100%',
  },
  loader: {
    margin: 'auto',
    width: 'fit-content',
    marginTop: 200,
  },
});

/**
 * Returns a map of date strings to empty arrays for a given number of upcoming days (including today)
 * @param numDays number of days to fetch
 * @returns map of key-value pairs where keys are MM/dd/yy strings and values are empty Shipment arrays
 */
const initializeDateMap = (numDays: number): { [key: string]: Shipment[] } => {
  const dateMap: { [key: string]: Shipment[] } = {};
  const today = new Date();

  // for each upcoming day, create a new Date and add its date string to our list
  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dateMap[format(date, 'MM/dd/yy')] = [];
  }

  return dateMap;
};

/**
 * The DashboardPage component shows a high-level overview of the next N days worth of shipments (default to a week view)
 */
export const DashboardPage: React.FC<{
  data: FetchShipmentsResult | LoadingResult;
}> = ({ children, data }) => {
  const classes = useStyles();
  const theme = useTheme();

  let component: ReactElement;
  switch (data.status) {
    case 'SUCCESS':
      // construct empty map of next x number of days
      const upcomingShipments = initializeDateMap(NUM_DAYS_PREVIEW);

      // for each shipment, if its estimatedArrival is in our list of upcoming dates, add it to the corresponding map entry
      data.shipments.forEach((shipment) => {
        if (upcomingShipments[shipment.estimatedArrival]) {
          upcomingShipments[shipment.estimatedArrival].push(shipment);
        }
      });

      // render
      component = (
        <Grid container spacing={3} className={classes.grid}>
          {Object.keys(upcomingShipments)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map((date) => (
              <Grid item xs={6} md={4} lg={3}>
                <Card className={classes.card}>
                  <CardHeader title={date}></CardHeader>
                  <hr />
                  <CardContent>
                    {upcomingShipments[date].length ? (
                      <DataGrid
                        className={classes.table}
                        rows={upcomingShipments[date]}
                        columns={COLUMNS}
                        pageSize={3}
                        autoHeight
                        disableSelectionOnClick
                      />
                    ) : (
                      <p>No shipments arriving</p>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      );
      break;
    case 'LOADING':
      component = (
        <Box className={classes.loader}>
          <Loader type="Grid" color={theme.palette.primary.main} />
        </Box>
      );
      break;
    case 'ERROR':
      component = <p>Error</p>;
      break;
  }

  return component;
};
