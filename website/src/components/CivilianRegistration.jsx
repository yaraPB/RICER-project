import React, { useState } from 'react';
import { TextField, Button, Select, MenuItem } from '@mui/material';
import { MuiTelInput } from 'mui-tel-input'
import { FormControl, InputLabel } from '@mui/material';

const CivilianRegistration = () => {
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

                <div className='flex place-content-center w-[90vw]'>
                    <Button type="submit" variant="contained" color="primary" sx={{width: "400px", padding: ".75rem", fontSize: "1rem", fontWeight: "700"}}>
                    Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CivilianRegistration;