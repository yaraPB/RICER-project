import React, { useRef, useState } from 'react';
import data from '../assets/data.json';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Stack,
  Box,
  Checkbox,
  useTheme,
  Select,
  MenuItem,
  Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const { equipmentData, infrastructureData, conditionOptions } = data;

const Dashboard = () => {
  const theme = useTheme();
  const equipRef = useRef(null);
  const infraRef = useRef(null);

  const [quantities, setQuantities] = useState(() => {
    const init = {};
    equipmentData.forEach(cat => cat.items.forEach(item => (init[item.id] = 0)));
    return init;
  });

  const [inspected, setInspected] = useState(() => {
    const init = {};
    equipmentData.forEach(cat => cat.items.forEach(item => (init[item.id] = false)));
    return init;
  });

  const [infrastructure, setInfrastructure] = useState(infrastructureData);

  const handleIncrement = id => {
    setQuantities(prev => ({ ...prev, [id]: prev[id] + 1 }));
  };

  const handleDecrement = id => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(prev[id] - 1, 0) }));
  };

  const handleQuantityChange = (id, value) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setQuantities(prev => ({ ...prev, [id]: num }));
    }
  };

  const handleInspectToggle = id => {
    setInspected(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleConditionChange = (type, pointId, newCondition) => {
    setInfrastructure(prev =>
      prev.map(infra =>
        infra.type !== type
          ? infra
          : {
              ...infra,
              points: infra.points.map(point =>
                point.id === pointId ? { ...point, condition: newCondition } : point
              )
            }
      )
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h2" align="center" fontWeight="bold" gutterBottom>
        Dashboard
      </Typography>

      {/* Scroll Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 4 }}>
        <Button variant="contained" onClick={() => equipRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          Go to Equipements
        </Button>
        <Button variant="contained" onClick={() => infraRef.current?.scrollIntoView({ behavior: 'smooth' })}>
          Go to Infrastructures
        </Button>
      </Box>

      <Typography ref={equipRef} variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Equipements
      </Typography>

      {/* Equipment Tables */}
      {equipmentData.map(({ category, items }) => (
        <Box
          key={category}
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 3,
            mb: 6,
            borderRadius: 2,
            border: '2px solid primary',
            bgcolor: '#b9d6fa'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {category}
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow bgcolor="orange">
                  <TableCell>Item</TableCell>
                  <TableCell align="center" width={180}>
                    Quantity
                  </TableCell>
                  <TableCell align="center" width={180}>
                    Inspected
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map(({ id, name }) => (
                  <TableRow key={id}>
                    <TableCell>{name}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <IconButton size="small" onClick={() => handleDecrement(id)} disabled={quantities[id] === 0}>
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          type="number"
                          inputProps={{ min: 0, style: { textAlign: 'center', width: 60 } }}
                          value={quantities[id]}
                          onChange={e => handleQuantityChange(id, e.target.value)}
                          size="small"
                          variant="standard"
                        />
                        <IconButton size="small" onClick={() => handleIncrement(id)}>
                          <AddIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Checkbox checked={inspected[id]} onChange={() => handleInspectToggle(id)} color="primary" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <Typography ref={infraRef} variant="h4" color="primary" fontWeight="bold" gutterBottom>
        Infrastructures
      </Typography>

      {infrastructure.map(({ type, points }) => (
        <Box
          key={type}
          sx={{
            backgroundColor: theme.palette.background.paper,
            p: 3,
            mb: 6,
            borderRadius: 2,
            border: '2px solid primary',
            bgcolor: '#b9d6fa'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {type}
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow bgcolor="orange">
                  <TableCell>Region Name</TableCell>
                  <TableCell align="center" width={180}>
                    Condition
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {points.map(({ id, name, condition }) => (
                  <TableRow key={id}>
                    <TableCell>{name}</TableCell>
                    <TableCell align="center">
                      <Select
                        value={condition}
                        onChange={e => handleConditionChange(type, id, e.target.value)}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        {conditionOptions.map(cond => (
                          <MenuItem key={cond} value={cond}>
                            {cond}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Container>
  );
};

export default Dashboard;
