import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  FormLabel, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Button,
  Typography,
  Box
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';

const PersonalInfoForm = ({ formData, onChange }) => {
  
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      onChange('photo', e.target.files[0]);
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="fullName"
          name="fullName"
          label="Full Name"
          fullWidth
          value={formData.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          required
          id="email"
          name="email"
          label="Email Address"
          type="email"
          fullWidth
          value={formData.email}
          onChange={(e) => onChange('email', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          id="address"
          name="address"
          label="Address"
          fullWidth
          value={formData.address}
          onChange={(e) => onChange('address', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Gender</FormLabel>
          <RadioGroup
            row
            name="gender"
            value={formData.gender}
            onChange={(e) => onChange('gender', e.target.value)}
          >
            <FormControlLabel value="Male" control={<Radio />} label="Male" />
            <FormControlLabel value="Female" control={<Radio />} label="Female" />
          </RadioGroup>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date of Birth"
            value={formData.dob ? new Date(formData.dob) : null}
            onChange={(date) => onChange('dob', date.toISOString().split('T')[0])}
            renderInput={(params) => <TextField {...params} fullWidth required />}
          />
        </LocalizationProvider>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          id="citizenshipNumber"
          name="citizenshipNumber"
          label="Citizenship Number"
          fullWidth
          value={formData.citizenshipNumber}
          onChange={(e) => onChange('citizenshipNumber', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControl fullWidth>
          <FormLabel>Profile Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="photo-upload"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="photo-upload">
              <Button variant="outlined" component="span">
                Upload Photo
              </Button>
            </label>
            {formData.photo && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.photo === 'string' 
                    ? formData.photo.split('/').pop() 
                    : formData.photo.name}
                </Typography>
                {typeof formData.photo !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.photo)} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default PersonalInfoForm;