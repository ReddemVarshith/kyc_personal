import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Divider,
  Chip,
} from '@mui/material'
import {
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material'

export default function AddressVerification({ onVerificationComplete }) {
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    aadharNumber: '',
  })
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    })
  }

  const handleVerification = async () => {
    setLoading(true)
    // Simulate API call to verify address
    setTimeout(() => {
      const result = {
        verified: Math.random() > 0.3,
        confidence: Math.floor(Math.random() * 20 + 80),
        matchedFields: ['street', 'city', 'state'],
        riskFactors: Math.random() > 0.7 ? ['Recent changes', 'Multiple addresses'] : [],
      }
      setVerificationStatus(result)
      setLoading(false)
      onVerificationComplete?.(result)
    }, 2000)
  }

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocationIcon color="primary" />
          Address Verification
        </Typography>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="AADHAR Number"
              name="aadharNumber"
              value={address.aadharNumber}
              onChange={handleChange}
              placeholder="Enter 12-digit AADHAR number"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              name="street"
              value={address.street}
              onChange={handleChange}
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={address.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State"
              name="state"
              value={address.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="PIN Code"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleVerification}
          disabled={loading}
          sx={{ mt: 3 }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Verify Address'
          )}
        </Button>

        {verificationStatus && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Alert
                severity={verificationStatus.verified ? 'success' : 'warning'}
                icon={
                  verificationStatus.verified ? (
                    <CheckCircleIcon />
                  ) : (
                    <WarningIcon />
                  )
                }
              >
                {verificationStatus.verified
                  ? 'Address verification successful'
                  : 'Address verification needs review'}
              </Alert>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Verification Details:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`${verificationStatus.confidence}% Confidence`}
                    color={
                      verificationStatus.confidence > 90 ? 'success' : 'warning'
                    }
                    size="small"
                  />
                  {verificationStatus.matchedFields.map((field) => (
                    <Chip
                      key={field}
                      label={`Matched: ${field}`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Stack>
              </Box>

              {verificationStatus.riskFactors.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Risk Factors:
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {verificationStatus.riskFactors.map((risk) => (
                      <Chip
                        key={risk}
                        label={risk}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}