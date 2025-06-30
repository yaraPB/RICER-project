import React from 'react'
import IncidentsMap from '../components/IncidentsMap'
import fireIncidents from '../assets/fire-incidents.json'
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Grid,
  Box
} from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'
import { format, subDays, eachDayOfInterval } from 'date-fns'

// Helper: Get last 14 days dates formatted as yyyy-MM-dd
const last14Days = eachDayOfInterval({
  start: subDays(new Date(), 13),
  end: new Date(),
}).map(d => format(d, 'yyyy-MM-dd'))

// Count incidents per day (date string: count)
const incidentsCountByDate = last14Days.reduce((acc, date) => {
  acc[date] = 0
  return acc
}, {})

// Fill counts based on fireIncidents dates
fireIncidents.forEach(({ date }) => {
  if (date in incidentsCountByDate) {
    incidentsCountByDate[date] += 1
  }
})

// Prepare data arrays for the chart
const dates = last14Days
const counts = last14Days.map(date => incidentsCountByDate[date])

// Cause counts for pie chart
const countBy = (arr, key) => {
  return arr.reduce((acc, item) => {
    const val = item[key]
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {})
}

const causeCounts = Object.entries(countBy(fireIncidents, 'cause')).map(([key, value]) => ({
  label: key,
  value
}))

const Incidents = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <IncidentsMap />

      <Typography variant="h5" gutterBottom sx={{ mt: 6 }}>
        Fire Incident Details
      </Typography>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Latitude</strong></TableCell>
              <TableCell><strong>Longitude</strong></TableCell>
              <TableCell><strong>Cause</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Severity</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {fireIncidents.map((incident) => (
              <TableRow key={incident.id}>
                <TableCell>{incident.id}</TableCell>
                <TableCell>{incident.position[0]}</TableCell>
                <TableCell>{incident.position[1]}</TableCell>
                <TableCell>{incident.cause}</TableCell>
                <TableCell>{incident.date}</TableCell>
                <TableCell>{incident.severity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Charts */}
      <Box sx={{ mt: 6 }}>
  <Grid container justifyContent="space-between" alignItems="flex-start" spacing={0}>
    <Grid item xs="auto" sx={{ width: '45%' }}>
      <Typography variant="h6" gutterBottom>
        Incidents in Last 2 Weeks
      </Typography>
      <LineChart
        xAxis={[
          {
            scaleType: 'point',
            data: dates,
          },
        ]}
        series={[
          {
            data: counts,
            label: 'Number of Incidents',
            curve: 'monotoneX',
          },
        ]}
        height={300}
      />
    </Grid>

    <Grid item xs="auto" sx={{ width: '45%' }}>
      <Typography variant="h6" gutterBottom>
        Cause Distribution
      </Typography>
      <PieChart
        series={[{
          data: causeCounts
        }]}
        height={300}
      />
    </Grid>
  </Grid>
</Box>

    </Container>
  )
}

export default Incidents
