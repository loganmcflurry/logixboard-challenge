import { ReactElement, useEffect, useState } from 'react';
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
import { fetchShipments, FetchShipmentsResult } from '../data/fetch-shipments';
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
  data: {
    width: '100%',
    height: '100%',
  },
  loader: {
    margin: 'auto',
    width: 'fit-content',
    marginTop: 200,
  },
});

type LoadingResult = {
  status: 'LOADING';
};
const INITIAL_RESULT: LoadingResult = {
  status: 'LOADING',
};

/**
 * Returns a list of MM/dd/yy date strings for a given number of upcoming days including today
 * @param numDays number of days to fetch
 * @returns array of date strings in the format MM/dd/yy
 */
const getUpcomingDateStrings = (numDays: number): string[] => {
  const dateStrings: string[] = [];
  const today = new Date();

  // for each upcoming day, create a new Date and add its date string to our list
  for (let i = 0; i < numDays; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dateStrings.push(format(date, 'MM/dd/yy'));
  }

  return dateStrings;
};

/**
 * The DashboardPage component shows a high-level overview of the next N days worth of shipments (default to a week view)
 */
export const DashboardPage: React.FC = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [fetchShipmentsResult, setFetchShipmentsResult] = useState<
    FetchShipmentsResult | LoadingResult
  >(INITIAL_RESULT);
  useEffect(() => {
    fetchShipments().then((result) => setFetchShipmentsResult(result));
  }, []);

  let component: ReactElement;
  switch (fetchShipmentsResult.status) {
    case 'SUCCESS':
      // construct empty map of next x number of days
      const upcomingDateStrings = getUpcomingDateStrings(NUM_DAYS_PREVIEW);
      const upcomingShipments: { [key: string]: Shipment[] } = {};
      for (const date of upcomingDateStrings) {
        upcomingShipments[date] = [];
      }

      // for each shipment, if its estimatedArrival is in our list of upcoming dates, add it to the corresponding map entry
      fetchShipmentsResult.shipments.map((shipment) => {
        const dateIdx = upcomingDateStrings.indexOf(shipment.estimatedArrival);
        if (dateIdx > -1) {
          upcomingShipments[upcomingDateStrings[dateIdx]].push(shipment);
        }
        return upcomingDateStrings[dateIdx];
      });

      component = (
        <Grid container spacing={3} className={classes.grid}>
          {upcomingDateStrings
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            .map((date) => (
              <Grid item xs={6} md={4} lg={3}>
                <Card className={classes.card}>
                  <CardHeader title={date}></CardHeader>
                  <hr />
                  <CardContent>
                    <p>
                      {upcomingShipments[date].length
                        ? null
                        : 'No shipments arriving'}
                    </p>
                    {upcomingShipments[date].length ? (
                      <DataGrid
                        className={classes.data}
                        rows={upcomingShipments[date]}
                        columns={COLUMNS}
                        pageSize={3}
                        autoHeight
                        disableSelectionOnClick
                      />
                    ) : null}
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
