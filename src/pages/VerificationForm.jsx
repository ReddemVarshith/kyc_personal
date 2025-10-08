import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useSnackbar } from 'notistack'
import * as validations from '../utils/validation'
import { fadeIn, slideUp, staggerContainer, scaleIn } from '../utils/animations'
import { DocumentService } from '../services/DocumentService'
import { AzureAIService } from '../services/AzureAIService'
import { AlertService } from '../services/AlertService'
import { AuditService } from '../services/AuditService'
import DocumentProcessor from '../components/DocumentProcessor'
import AddressVerification from '../components/AddressVerification'

const steps = [
  'Personal Information',
  'Document Upload',
  'Address Verification',
  'Final Verification',
]

export default function VerificationForm() {
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    documents: [],
    addressVerification: null,
  })
  const [processing, setProcessing] = useState(false)

  const [verificationStatus, setVerificationStatus] = useState({
    documentProcessed: false,
    addressVerified: false,
    complianceChecked: false,
    alerts: []
  });

  const processDocument = async (file) => {
    try {
      const processedData = await DocumentService.processDocument(file);
      const validationResult = await DocumentService.validateDocument(processedData);
      const aiAnalysis = await AzureAIService.verifyIdentity(processedData);
      
      await AuditService.logActivity({
        type: 'DOCUMENT_PROCESSING',
        data: processedData,
        result: validationResult
      });

      if (aiAnalysis.fraudProbability > 0.3) {
        await AlertService.generateAlert({
          severity: 'high',
          message: 'High fraud probability detected in document'
        });
      }

      setVerificationStatus(prev => ({
        ...prev,
        documentProcessed: true,
        alerts: aiAnalysis.fraudProbability > 0.3 ? [...prev.alerts, 'High fraud risk detected'] : prev.alerts
      }));

      return { processedData, validationResult, aiAnalysis };
    } catch (error) {
      console.error('Document processing failed:', error);
      setVerificationStatus(prev => ({
        ...prev,
        alerts: [...prev.alerts, 'Document processing failed']
      }));
      throw error;
    }
  };

  const verifyAddress = async (addressData) => {
    try {
      const addressValidation = await AzureAIService.validateAddress(addressData);
      const complianceCheck = await AlertService.checkCompliance({
        type: 'ADDRESS_VERIFICATION',
        data: addressValidation
      });

      await AuditService.logActivity({
        type: 'ADDRESS_VERIFICATION',
        data: addressValidation,
        result: complianceCheck
      });

      setVerificationStatus(prev => ({
        ...prev,
        addressVerified: true,
        complianceChecked: true
      }));

      return { addressValidation, complianceCheck };
    } catch (error) {
      console.error('Address verification failed:', error);
      setVerificationStatus(prev => ({
        ...prev,
        alerts: [...prev.alerts, 'Address verification failed']
      }));
      throw error;
    }
  };

  const handleNext = async () => {
    try {
      if (activeStep === 1) {
        await processDocument(documentData);
      } else if (activeStep === 2) {
        await verifyAddress(addressData);
      }
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    } catch (error) {
      console.error('Step processing failed:', error);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    const monitorActivity = async () => {
      try {
        await AlertService.monitorActivity({
          step: activeStep,
          status: verificationStatus
        });
      } catch (error) {
        console.error('Activity monitoring failed:', error);
      }
    };

    monitorActivity();
  }, [activeStep, verificationStatus]);

  const handleSubmit = async () => {
    setProcessing(true)
    // Simulate API call
    setTimeout(() => {
      setProcessing(false)
      // Handle submission success
    }, 2000)
  }

  const handleDocumentsProcessed = (documents) => {
    setFormData((prev) => ({
      ...prev,
      documents,
    }))
  }

  const handleAddressVerified = (result) => {
    setFormData((prev) => ({
      ...prev,
      addressVerification: result,
    }))
  }

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date of Birth"
                    InputLabelProps={{ shrink: true }}
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      setFormData({ ...formData, dateOfBirth: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="email"
                    label="Email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )
      case 1:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Document Upload
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Please upload clear copies of your AADHAR card and supporting
                documents
              </Alert>
              <DocumentProcessor onDocumentsProcessed={handleDocumentsProcessed} />
            </CardContent>
          </Card>
        )
      case 2:
        return <AddressVerification onVerificationComplete={handleAddressVerified} />
      case 3:
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Verification Summary
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert
                    severity={
                      formData.documents.length > 0 &&
                      formData.addressVerification?.verified
                        ? 'success'
                        : 'warning'
                    }
                  >
                    {formData.documents.length > 0 &&
                    formData.addressVerification?.verified
                      ? 'All verifications completed successfully'
                      : 'Some verifications are pending or require review'}
                  </Alert>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Documents Processed: {formData.documents.length}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Address Verification:{' '}
                    {formData.addressVerification?.verified
                      ? 'Verified'
                      : 'Pending'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )
      default:
        return null
    }
  }

  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message, variant = 'info') => {
    enqueueSnackbar(message, { 
      variant,
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' }
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <Box sx={{ width: '100%' }}>
        <Paper sx={{ p: 3 }}>
          <motion.div variants={fadeIn}>
            <Typography variant="h5" gutterBottom>
              KYC Verification Process
            </Typography>
            <Stepper
              activeStep={activeStep}
              sx={{ mb: 4, overflowX: 'auto', flexWrap: 'nowrap' }}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={slideUp}
            >
              {renderStepContent(activeStep)}
            </motion.div>
          </AnimatePresence>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={processing}
              startIcon={
                processing ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </Box>
          {verificationStatus.alerts.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <Box sx={{ mt: 3 }}>
                {verificationStatus.alerts.map((alert, index) => (
                  <Alert 
                    key={index} 
                    severity="warning" 
                    sx={{ mb: 1 }}
                    onClose={() => {
                      const newAlerts = [...verificationStatus.alerts];
                      newAlerts.splice(index, 1);
                      setVerificationStatus(prev => ({
                        ...prev,
                        alerts: newAlerts
                      }));
                    }}
                  >
                    {alert}
                  </Alert>
                ))}
              </Box>
            </motion.div>
          )}
        </Paper>
      </Box>
    </motion.div>
  )
}