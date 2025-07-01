import React, { useRef, useState } from 'react';
import data from '../assets/data.json';
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
  IconButton,
  TextField,
  Stack,
  Checkbox,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const { equipmentData, infrastructureData, conditionOptions } = data;

const Dashboard = () => {
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

  // Refs for scrolling to sections
  const categoryRefs = useRef({});
  const typeRefs = useRef({});

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'aliceblue', position: "sticky" }}>
      {/* Manual Sidebar */}
      <Box 
       sx={{
    width: 220,
    py: "80px",
    px: "12px",
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start', 
    height: '100vh', 
    overflowY: 'auto',
    bgcolor: 'aliceblue', 
  }}>

        <Typography variant="body2" fontWeight={600}  mb={1}>
          Equipments
        </Typography>
        {equipmentData.map(({ category }) => (
          <Typography
            key={category}
            variant="body2"
            sx={{ pl: 1, py: "4px", mb: 0.5, cursor: 'pointer', '&:hover': { transform: "scale(1.1)" } }}
            onClick={() => categoryRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {category}
          </Typography>
        ))}

        <Typography variant="body2" fontWeight={600}  mt={2} mb={1}>
          Infrastructures
        </Typography>
        {infrastructure.map(({ type }) => (
          <Typography
            key={type}
            variant="body2"
            sx={{ pl: 1, mb: 0.5, cursor: 'pointer', '&:hover': { transform: "scale(1.1)" } }}
            onClick={() => typeRefs.current[type]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {type}
          </Typography>
        ))}
      </Box>

      {/* Main Table */}
      <Box sx={{ flex: 1, p: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Equipment & Infrastructure Overview
        </Typography>

        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Quantity / Condition</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Inspected</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Equipment Rows */}
              {equipmentData.map(({ category, items }) => (
                <React.Fragment key={category}>
                  <TableRow ref={el => (categoryRefs.current[category] = el)} sx={{ backgroundColor: '#303030'}}>
                    <TableCell colSpan={4} sx={{ fontWeight: 600, color: "white" }}>
                      {category}
                    </TableCell>
                  </TableRow>
                  {items.map(({ id, name }) => (
                    <TableRow key={id} hover>
                      <TableCell>{name}</TableCell>
                      <TableCell>{category}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          <IconButton size="small" onClick={() => handleDecrement(id)} disabled={quantities[id] === 0}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <TextField
                            type="number"
                            inputProps={{ min: 0, style: { textAlign: 'center', width: 50 } }}
                            value={quantities[id]}
                            onChange={e => handleQuantityChange(id, e.target.value)}
                            size="small"
                            variant="standard"
                          />
                          <IconButton size="small" onClick={() => handleIncrement(id)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={inspected[id]}
                          onChange={() => handleInspectToggle(id)}
                          color="default"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}

              {/* Infrastructure Rows */}
              {infrastructure.map(({ type, points }) => (
                <React.Fragment key={type}>
                  <TableRow ref={el => (typeRefs.current[type] = el)} sx={{ backgroundColor: '#303030'}}>
                    <TableCell colSpan={4} sx={{ fontWeight: 600, color: "white" }}>
                      {type}
                    </TableCell>
                  </TableRow>
                  {points.map(({ id, name, condition }) => (
                    <TableRow key={id} hover>
                      <TableCell>{name}</TableCell>
                      <TableCell>{type}</TableCell>
                      <TableCell align="center">
                        <Select
                          value={condition}
                          onChange={e => handleConditionChange(type, id, e.target.value)}
                          size="small"
                          variant="standard"
                          sx={{ minWidth: 120 }}
                        >
                          {conditionOptions.map(opt => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell align="center">—</TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;
