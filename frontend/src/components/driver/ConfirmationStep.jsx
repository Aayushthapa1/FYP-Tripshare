import React from 'react';
import { Box, Typography, Paper, Alert, AlertTitle } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ConfirmationStep = () => {
  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
      
      <Typography variant="h5" gutterBottom>
        Registration Submitted Successfully!
      </Typography>
      
      <Typography variant="body1" color="textSecondary" paragraph>
        Thank you for submitting your driver registration information.
      </Typography>
      
      <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', p: 3, maxWidth: '600px', mx: 'auto', my: 3 }}>
        <Typography variant="body1" paragraph>
          Your application has been received and will be reviewed by our admin team. This process may take 1-3 business days.
        </Typography>
        
        <Typography variant="body1">
          You'll receive an email notification about your verification status. Once verified, you can start using our platform to offer rides.
        </Typography>
      </Paper>
      
      <Alert severity="info" sx={{ maxWidth: '600px', mx: 'auto', mt: 3 }}>
        <AlertTitle>What's Next?</AlertTitle>
        You can view your application status anytime in your driver dashboard.
      </Alert>
    </Box>
  );
};

export default ConfirmationStep;