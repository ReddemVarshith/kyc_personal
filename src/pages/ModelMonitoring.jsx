import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'

export default function ModelMonitoring() {
  const modelMetrics = [
    {
      name: 'Document Classification',
      accuracy: 98.5,
      status: 'Optimal',
      lastUpdated: '2024-02-20',
      type: 'Azure OpenAI',
    },
    {
      name: 'Address Verification',
      accuracy: 95.2,
      status: 'Good',
      lastUpdated: '2024-02-20',
      type: 'GNN',
    },
    {
      name: 'Fraud Detection',
      accuracy: 92.8,
      status: 'Needs Attention',
      lastUpdated: '2024-02-19',
      type: 'NLP',
    },
  ]

  const recentPredictions = [
    {
      id: 1,
      documentType: 'AADHAR Card',
      confidence: 99.2,
      timestamp: '2024-02-20 14:30',
      status: 'Verified',
    },
    {
      id: 2,
      documentType: 'Utility Bill',
      confidence: 88.5,
      timestamp: '2024-02-20 14:25',
      status: 'Manual Review',
    },
    {
      id: 3,
      documentType: 'Bank Statement',
      confidence: 95.7,
      timestamp: '2024-02-20 14:20',
      status: 'Verified',
    },
  ]

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'optimal':
        return 'success'
      case 'good':
        return 'primary'
      case 'needs attention':
        return 'warning'
      case 'verified':
        return 'success'
      case 'manual review':
        return 'warning'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        AI Model Monitoring
      </Typography>

      <Grid container spacing={3}>
        {modelMetrics.map((model) => (
          <Grid item xs={12} md={4} key={model.name}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {model.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Type: {model.type}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={model.accuracy}
                      color={
                        model.accuracy > 95
                          ? 'success'
                          : model.accuracy > 90
                          ? 'primary'
                          : 'warning'
                      }
                    />
                  </Box>
                  <Typography variant="body2">{model.accuracy}%</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Chip
                    label={model.status}
                    color={getStatusColor(model.status)}
                    size="small"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Updated: {model.lastUpdated}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Document Type</TableCell>
                    <TableCell>Confidence</TableCell>
                    <TableCell>Timestamp</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentPredictions.map((prediction) => (
                    <TableRow key={prediction.id}>
                      <TableCell>{prediction.documentType}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 100, mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={prediction.confidence}
                              color={
                                prediction.confidence > 95
                                  ? 'success'
                                  : prediction.confidence > 90
                                  ? 'primary'
                                  : 'warning'
                              }
                            />
                          </Box>
                          <Typography variant="body2">
                            {prediction.confidence}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{prediction.timestamp}</TableCell>
                      <TableCell>
                        <Chip
                          label={prediction.status}
                          color={getStatusColor(prediction.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}