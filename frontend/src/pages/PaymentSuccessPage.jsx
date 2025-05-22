import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        // Get tx_ref from URL parameters
        const params = new URLSearchParams(location.search);
        const tx_ref = params.get('tx_ref');
        
        if (!tx_ref) {
          console.log('No tx_ref found in URL parameters');
          setStatus('error');
          setMessage('Payment reference not found');
          setLoading(false);
          return;
        }

        // Verify payment status with backend
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || '/api'}/payments/verify/${tx_ref}`
        );

        console.log('Payment verification response:', response.data);
        
        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message);
          setJobId(response.data.jobId);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [location]);

  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Verifying your payment...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          {status === 'success' ? (
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          ) : (
            <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
          )}

          <Typography variant="h4" component="h1" gutterBottom>
            {status === 'success' ? 'Payment Successful!' : 'Payment Verification Issue'}
          </Typography>

          <Typography variant="body1" paragraph>
            {status === 'success' 
              ? 'Thank you for your payment. Your job posting has been successfully processed.'
              : message || 'There was an issue verifying your payment. Please contact support.'}
          </Typography>

          {status === 'success' && (
            <Typography variant="body1" paragraph>
              You can now view your job posting in the jobs list.
            </Typography>
          )}

          <Box sx={{ mt: 4 }}>
            {status === 'success' && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/jobs')}
                  sx={{ mr: 2 }}
                >
                  View Jobs
                </Button>

                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => navigate('/employer/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/employer/dashboard')}
              >
                Back to Dashboard
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage; 