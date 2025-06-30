import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input'
import { FormControl, InputLabel } from '@mui/material';

const GovRegistration = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        CIN: '',
        phone: '',
        department: '',
        title: ''
    });

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic
    };

    const handlePhoneChange = (newPhone) => {
        setFormData((prev) => ({ ...prev, phone: newPhone }));
    };

    return (
        <div className='flex justify-center'>
            <form onSubmit={handleSubmit}
                className='m-2 grid grid-cols-2 gap-8 rounded-2xl p-8 '
            >
                <TextField
                    label="Full Name"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    margin="normal"
                    required
                    variant='filled'
                />
                <TextField
                    variant='filled'
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <TextField
                    variant='filled'
                    label="CIN"
                    name="CIN"
                    type="CIN"
                    value={formData.CIN}
                    onChange={handleChange}
                    margin="normal"
                    required
                />
                <MuiTelInput
                    margin="normal"
                    variant='filled'
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    defaultCountry="MA"
                    required
                />
                <FormControl variant="filled" margin="normal" required>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                        labelId="department-label"
                        value={formData.department}
                        onChange={handleChange}
                        name="department"
                    >
                        <MenuItem value="ADM">ADM — Autoroutes du Maroc</MenuItem>
                        <MenuItem value="CCDRF">CCDRF — Centre de Conservation et de Développement des Ressources Forestières</MenuItem>
                        <MenuItem value="CEDEFO">CEDEFO — Centre de Défense des Forêts</MenuItem>
                        <MenuItem value="DFCI">DFCI — Défense de Forêts Contre les Incendies</MenuItem>
                        <MenuItem value="DPEFLCD">DPEFLCD — Direction Provinciale des Eaux et Forêts et de la Lutte Contre la Désertification</MenuItem>
                        <MenuItem value="DREFLCD">DREFLCD — Direction Régionale des Eaux et Forêts et de la Lutte Contre la Désertification</MenuItem>
                        <MenuItem value="FA">FA — Forces Auxiliaires</MenuItem>
                        <MenuItem value="FAR">FAR — Forces Armées Royales</MenuItem>
                        <MenuItem value="GPS">GPS — Global Positioning System</MenuItem>
                        <MenuItem value="GR">GR — Gendarmerie Royale</MenuItem>
                        <MenuItem value="HCEFLCD">HCEFLCD — Haut Commissariat aux Eaux et Forêts et à la Lutte contre la Désertification</MenuItem>
                        <MenuItem value="MET">MET — Ministère de l'Équipement et du Transport</MenuItem>
                        <MenuItem value="MI">MI — Ministère de l'Intérieur</MenuItem>
                        <MenuItem value="MJS">MJS — Ministère de la Jeunesse et des Sports</MenuItem>
                        <MenuItem value="ONCE">ONCE — Office National des Chemins de Fer</MenuItem>
                        <MenuItem value="ONDA">ONDA — Office National Des Aéroports</MenuItem>
                        <MenuItem value="ONEEP">ONEEP — Office National de l'Électricité et de l'Eau Potable</MenuItem>
                        <MenuItem value="OTDF">OTDF — Occupation Temporaire du Domaine Forestier</MenuItem>
                        <MenuItem value="PN">PN — Promotion Nationale</MenuItem>
                        <MenuItem value="RAA">RAA — Revue Après Action</MenuItem>
                        <MenuItem value="SF">SF — Secteur Forestier</MenuItem>
                        <MenuItem value="SIG">SIG — Système d'Information Géographique</MenuItem>
                        <MenuItem value="TPF">TPF — Tranchée Pare-Feu</MenuItem>
                        <MenuItem value="USFS">USFS — United States Forest Service</MenuItem>
                        <MenuItem value="VPI">VPI — Véhicule de Première Intervention</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    variant='filled'
                    label="Title"
                    name="title"
                    type="title"
                    value={formData.title}
                    onChange={handleChange}
                    margin="normal"
                    required
                />

                <div className='flex place-content-center w-[90vw]'>
                    <Button type="submit" variant="contained" color="primary" sx={{width: "400px", padding: ".75rem", fontSize: "1rem", fontWeight: "700"}}>
                    Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default GovRegistration;