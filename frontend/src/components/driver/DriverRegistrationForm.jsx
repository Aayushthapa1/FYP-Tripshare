import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stepper, Step, StepLabel, Button, Typography, Box, Container, Paper, Grid } from '@mui/material';
import PersonalInfoForm from './steps/PersonalInfoForm';
import LicenseInfoForm from './steps/LicenseInfoForm';
import VehicleInfoForm from './steps/VehicleInfoForm';
import ConfirmationStep from './steps/ConfirmationStep';

const steps = ['Personal Information', 'License Information', 'Vehicle Information', 'Confirmation'];

const DriverRegistrationForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState(null);
  const [formData, setFormData] = useState({
    personal: {
      fullName: '',
      address: '',
      email: '',
      gender: '',
      dob: '',
      citizenshipNumber: '',
      photo: null
    },
    license: {
      licenseNumber: '',
      frontPhoto: null,
      backPhoto: null
    },
    vehicle: {
      vehicleType: '',
      numberPlate: '',
      productionYear: '',
      vehiclePhoto: null,
      vehicleDetailPhoto: null,
      ownerDetailPhoto: null,
      renewalDetailPhoto: null
    }
  });

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handlePersonalFormChange = (field, value) => {
    setFormData({
      ...formData,
      personal: {
        ...formData.personal,
        [field]: value
      }
    });
  };

  const handleLicenseFormChange = (field, value) => {
    setFormData({
      ...formData,
      license: {
        ...formData.license,
        [field]: value
      }
    });
  };

  const handleVehicleFormChange = (field, value) => {
    setFormData({
      ...formData,
      vehicle: {
        ...formData.vehicle,
        [field]: value
      }
    });
  };

  const submitPersonalInfo = async () => {
    setLoading(true);
    try {
      const formPayload = new FormData();
      
      Object.keys(formData.personal).forEach(key => {
        formPayload.append(key, formData.personal[key]);
      });

      const response = await axios.post('/api/driver/personalinfo', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setDriverId(response.data.driver._id);
      handleNext();
    } catch (error) {
      console.error('Error submitting personal information:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to submit personal information'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitLicenseInfo = async () => {
    setLoading(true);
    try {
      const formPayload = new FormData();
      
      Object.keys(formData.license).forEach(key => {
        formPayload.append(key, formData.license[key]);
      });
      formPayload.append('driverId', driverId);

      await axios.post('/api/driver/licenseinfo', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      handleNext();
    } catch (error) {
      console.error('Error submitting license information:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to submit license information'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitVehicleInfo = async () => {
    setLoading(true);
    try {
      const formPayload = new FormData();
      
      Object.keys(formData.vehicle).forEach(key => {
        formPayload.append(key, formData.vehicle[key]);
      });
      formPayload.append('driverId', driverId);

      await axios.post('/api/driver/vehicleinfo', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      handleNext();
    } catch (error) {
      console.error('Error submitting vehicle information:', error);
      alert(`Error: ${error.response?.data?.message || 'Failed to submit vehicle information'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStepSubmit = () => {
    switch (activeStep) {
      case 0:
        submitPersonalInfo();
        break;
      case 1:
        submitLicenseInfo();
        break;
      case 2:
        submitVehicleInfo();
        break;
      default:
        handleNext();
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoForm 
            formData={formData.personal} 
            onChange={handlePersonalFormChange} 
          />
        );
      case 1:
        return (
          <LicenseInfoForm 
            formData={formData.license} 
            onChange={handleLicenseFormChange} 
          />
        );
      case 2:
        return (
          <VehicleInfoForm 
            formData={formData.vehicle} 
            onChange={handleVehicleFormChange} 
          />
        );
      case 3:
        return <ConfirmationStep />;
      default:
        return 'Unknown step';
    }
  };

  const isStepValid = () => {
    const { personal, license, vehicle } = formData;
    
    switch (activeStep) {
      case 0:
        return (
          personal.fullName && 
          personal.address && 
          personal.email && 
          personal.gender && 
          personal.dob && 
          personal.citizenshipNumber && 
          personal.photo
        );
      case 1:
        return (
          license.licenseNumber && 
          license.frontPhoto && 
          license.backPhoto
        );
      case 2:
        return (
          vehicle.vehicleType && 
          vehicle.numberPlate && 
          vehicle.productionYear && 
          vehicle.vehiclePhoto && 
          vehicle.vehicleDetailPhoto && 
          vehicle.ownerDetailPhoto && 
          vehicle.renewalDetailPhoto
        );
      default:
        return true;
    }
  };

  const finishRegistration = () => {
    navigate('/driver/dashboard');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Driver Registration
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <React.Fragment>
          {getStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={activeStep === steps.length - 1 ? finishRegistration : handleStepSubmit}
              disabled={!isStepValid() || loading}
            >
              {loading ? 'Processing...' : 
                activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Box>
        </React.Fragment>
      </Paper>
    </Container>
  );
};

export default DriverRegistrationForm;