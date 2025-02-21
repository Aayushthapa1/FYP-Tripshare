import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  FormLabel,
  Button,
  Typography,
  Box
} from '@mui/material';

const LicenseInfoForm = ({ formData, onChange }) => {
  
  const handleFileChange = (fieldName, e) => {
    if (e.target.files[0]) {
      onChange(fieldName, e.target.files[0]);
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          License Information
        </Typography>
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          required
          id="licenseNumber"
          name="licenseNumber"
          label="License Number"
          fullWidth
          value={formData.licenseNumber}
          onChange={(e) => onChange('licenseNumber', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <FormLabel>License Front Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="front-photo-upload"
              type="file"
              onChange={(e) => handleFileChange('frontPhoto', e)}
            />
            <label htmlFor="front-photo-upload">
              <Button variant="outlined" component="span">
                Upload Front Photo
              </Button>
            </label>
            {formData.frontPhoto && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.frontPhoto === 'string' 
                    ? formData.frontPhoto.split('/').pop() 
                    : formData.frontPhoto.name}
                </Typography>
                {typeof formData.frontPhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.frontPhoto)} 
                      alt="License Front" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <FormLabel>License Back Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="back-photo-upload"
              type="file"
              onChange={(e) => handleFileChange('backPhoto', e)}
            />
            <label htmlFor="back-photo-upload">
              <Button variant="outlined" component="span">
                Upload Back Photo
              </Button>
            </label>
            {formData.backPhoto && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.backPhoto === 'string' 
                    ? formData.backPhoto.split('/').pop() 
                    : formData.backPhoto.name}
                </Typography>
                {typeof formData.backPhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.backPhoto)} 
                      alt="License Back" 
                      style={{ maxWidth: '100%', maxHeight: '200px' }} 
                    />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </FormControl>
      </Grid>
      
      <Grid item xs={12}>
        <Typography variant="body2" color="textSecondary">
          Please upload clear, readable images of your driver's license. Ensure all information is visible.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default LicenseInfoForm;