import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Paper sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Terms and Conditions
        </Typography>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to our website. If you continue to browse and use this website, you are agreeing to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern our relationship with you in relation to this website. If you disagree with any part of these terms and conditions, please do not use our website.
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            2. Intellectual Property
          </Typography>
          <Typography variant="body1" paragraph>
            The content of the pages of this website is for your general information and use only. It is subject to change without notice. This website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            3. Use of the Service
          </Typography>
          <Typography variant="body1" paragraph>
            Your use of any information or materials on this website is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through this website meet your specific requirements.
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            4. User Accounts
          </Typography>
          <Typography variant="body1" paragraph>
            To access certain features of the website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
          </Typography>
        </Box>

        <Box sx={{ my: 2 }}>
          <Typography variant="h6" gutterBottom>
            5. Limitation of Liability
          </Typography>
          <Typography variant="body1" paragraph>
            In no event will we be liable for any loss or damage including without limitation, indirect or consequential loss or damage, or any loss or damage whatsoever arising from loss of data or profits arising out of, or in connection with, the use of this website.
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          These terms and conditions are subject to change.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TermsPage;
