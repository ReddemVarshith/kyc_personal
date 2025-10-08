import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Grid,
} from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'

export default function ComplianceReports() {
  const reports = [
    {
      id: 1,
      date: '2024-02-20',
      type: 'KYC Verification',
      status: 'Compliant',
      risk: 'Low',
      actions: 'No action needed',
    },
    {
      id: 2,
      date: '2024-02-19',
      type: 'Address Verification',
      status: 'Non-Compliant',
      risk: 'High',
      actions: 'Manual review required',
    },
    {
      id: 3,
      date: '2024-02-18',
      type: 'Document Verification',
      status: 'Pending',
      risk: 'Medium',
      actions: 'Awaiting verification',
    },
  ]

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'success'
      case 'non-compliant':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getRiskColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'high':
        return 'error'
      case 'medium':
        return 'warning'
      case 'low':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography variant="h4">Compliance Reports</Typography>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => {
                // TODO: Implement report download
                console.log('Downloading report...')
              }}
            >
              Download Report
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Risk Level</TableCell>
                  <TableCell>Required Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.risk}
                        color={getRiskColor(report.risk)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{report.actions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  )
}