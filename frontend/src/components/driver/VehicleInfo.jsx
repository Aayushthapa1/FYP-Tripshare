import React from 'react';
import { 
  Grid, 
  TextField, 
  FormControl, 
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Box
} from '@mui/material';

const VehicleInfoForm = ({ formData, onChange }) => {
  
  const handleFileChange = (fieldName, e) => {
    if (e.target.files[0]) {
      onChange(fieldName, e.target.files[0]);
    }
  };
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Vehicle Information
        </Typography>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <FormControl fullWidth required>
          <InputLabel id="vehicle-type-label">Vehicle Type</InputLabel>
          <Select
            labelId="vehicle-type-label"
            id="vehicleType"
            value={formData.vehicleType}
            label="Vehicle Type"
            onChange={(e) => onChange('vehicleType', e.target.value)}
          >
            <MenuItem value="Car">Car</MenuItem>
            <MenuItem value="Bike">Bike</MenuItem>
            <MenuItem value="Electric">Electric</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          required
          id="numberPlate"
          name="numberPlate"
          label="Number Plate"
          fullWidth
          value={formData.numberPlate}
          onChange={(e) => onChange('numberPlate', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} sm={4}>
        <TextField
          required
          id="productionYear"
          name="productionYear"
          label="Production Year"
          fullWidth
          value={formData.productionYear}
          onChange={(e) => onChange('productionYear', e.target.value)}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <FormLabel>Vehicle Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="vehicle-photo-upload"
              type="file"
              onChange={(e) => handleFileChange('vehiclePhoto', e)}
            />
            <label htmlFor="vehicle-photo-upload">
              <Button variant="outlined" component="span">
                Upload Vehicle Photo
              </Button>
            </label>
            {formData.vehiclePhoto && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.vehiclePhoto === 'string' 
                    ? formData.vehiclePhoto.split('/').pop() 
                    : formData.vehiclePhoto.name}
                </Typography>
                {typeof formData.vehiclePhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.vehiclePhoto)} 
                      alt="Vehicle" 
                      style={{ maxWidth: '100%', maxHeight: '150px' }} 
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
          <FormLabel>Vehicle Detail Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="vehicle-detail-upload"
              type="file"
              onChange={(e) => handleFileChange('vehicleDetailPhoto', e)}
            />
            <label htmlFor="vehicle-detail-upload">
              <Button variant="outlined" component="span">
                Upload Vehicle Details
              </Button>
            </label>
            {formData.vehicleDetailPhoto && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.vehicleDetailPhoto === 'string' 
                    ? formData.vehicleDetailPhoto.split('/').pop() 
                    : formData.vehicleDetailPhoto.name}
                </Typography>
                {typeof formData.vehicleDetailPhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.vehicleDetailPhoto)} 
                      alt="Vehicle Details" 
                      style={{ maxWidth: '100%', maxHeight: '150px' }} 
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
          <FormLabel>Owner Detail Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="owner-detail-upload"
              type="file"
              onChange={(e) => handleFileChange('ownerDetailPhoto', e)}
            />
            <label htmlFor="owner-detail-upload">
              <Button variant="outlined" component="span">
                Upload Owner Details
              </Button>
            </label>
            {formData.ownerDetailPhoto && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.ownerDetailPhoto === 'string' 
                    ? formData.ownerDetailPhoto.split('/').pop() 
                    : formData.ownerDetailPhoto.name}
                </Typography>
                {typeof formData.ownerDetailPhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.ownerDetailPhoto)} 
                      alt="Owner Details" 
                      style={{ maxWidth: '100%', maxHeight: '150px' }} 
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
          <FormLabel>Renewal Detail Photo</FormLabel>
          <Box sx={{ mt: 1 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="renewal-detail-upload"
              type="file"
              onChange={(e) => handleFileChange('renewalDetailPhoto', e)}
            />
            <label htmlFor="renewal-detail-upload">
              <Button variant="outlined" component="span">
                Upload Renewal Details
              </Button>
            </label>
            {formData.renewalDetailPhoto && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="textSecondary">
                  {typeof formData.renewalDetailPhoto === 'string' 
                    ? formData.renewalDetailPhoto.split('/').pop() 
                    : formData.renewalDetailPhoto.name}
                </Typography>
                {typeof formData.renewalDetailPhoto !== 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img 
                      src={URL.createObjectURL(formData.renewalDetailPhoto)} 
                      alt="Renewal Details" 
                      style={{ maxWidth: '100%', maxHeight: '150px' }} 
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
          Please upload clear images of your vehicle from different angles. Make sure all documents are readable.
        </Typography>
      </Grid>
    </Grid>
  );
};

export default VehicleInfoForm;