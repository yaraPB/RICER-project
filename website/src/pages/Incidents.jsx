import React from 'react'
import IncidentsMap from '../components/IncidentsMap'
import fireIncidents from '../assets/fire-incidents.json'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent
} from '@mui/material'
import { LineChart, PieChart } from '@mui/x-charts'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import WeatherAPI from '../components/WeatherAPI'

// Prepare data
const last14Days = eachDayOfInterval({
  start: subDays(new Date(), 13),
  end: new Date(),
}).map(d => format(d, 'yyyy-MM-dd'))

const incidentsCountByDate = last14Days.reduce((acc, date) => {
  acc[date] = 0
  return acc
}, {})

fireIncidents.forEach(({ date }) => {
  if (date in incidentsCountByDate) {
    incidentsCountByDate[date] += 1
  }
})

const dates = last14Days
const counts = last14Days.map(date => incidentsCountByDate[date])

const countBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const val = item[key]
    acc[val] = (acc[val] || 0) + 1
    return acc
  }, {})

const causeCounts = Object.entries(countBy(fireIncidents, 'cause')).map(([key, value]) => ({
  label: key,
  value
}))

const Incidents = () => {
  return (
    <Box sx={{ px: 3, py: 2 }}>

      {/* Top Section: Weather + Map + Charts side by side */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          placeContent: "center",
          justifyContent: "center",
          gap: 2,
          mb: 4,
        }}
      >

        {/* Weather Panel */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
            minWidth: 250,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Weather Info
          </Typography>
          <WeatherAPI />
        </Box>

        {/* Map Panel */}
        <Box
          sx={{
            flex: 2,
            bgcolor: 'background.paper',
            p: 2,
            borderRadius: 2,
            boxShadow: 1,
            minWidth: 300,
          }}
        >
        
          <Box sx={{ width: '100%', height: '100%' }}>
            <IncidentsMap />
          </Box>
        </Box>

        {/* Charts Panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 300,
            height: '100%'
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Incidents in Last 2 Weeks
              </Typography>
              <LineChart
                xAxis={[{ scaleType: 'point', data: dates }]}
                series={[{ data: counts, label: 'Incidents', curve: 'monotoneX' }]}
                height={200}
              />
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cause Distribution
              </Typography>
              <PieChart
                series={[{ data: causeCounts }]}
                height={200}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Bottom: Full-width Fire Incidents Table */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Fire Incident Details
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small" stickyHeader>
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
      </Box>
    </Box>
  )
}

export default Incidents
