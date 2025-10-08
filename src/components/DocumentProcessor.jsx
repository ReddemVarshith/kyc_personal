import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'

export default function DocumentProcessor({ onDocumentsProcessed }) {
  const [documents, setDocuments] = useState([])
  const [processing, setProcessing] = useState(false)

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf'],
    },
    onDrop: async (acceptedFiles) => {
      setProcessing(true)
      const newDocs = acceptedFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        status: 'processing',
        type: 'unknown',
        confidence: 0,
        preview: URL.createObjectURL(file),
      }))

      setDocuments([...documents, ...newDocs])

      // Simulate document processing
      setTimeout(() => {
        const processedDocs = newDocs.map((doc) => ({
          ...doc,
          status: 'completed',
          type: detectDocumentType(doc.file.name),
          confidence: Math.floor(Math.random() * 20 + 80), // 80-100%
        }))
        setDocuments((prevDocs) =>
          prevDocs.map(
            (doc) =>
              processedDocs.find((pDoc) => pDoc.id === doc.id) || doc
          )
        )
        setProcessing(false)
        onDocumentsProcessed?.(processedDocs)
      }, 2000)
    },
  })

  const detectDocumentType = (filename) => {
    const types = ['AADHAR Card', 'Utility Bill', 'Bank Statement']
    return types[Math.floor(Math.random() * types.length)]
  }

  const removeDocument = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />
      case 'processing':
        return <AssignmentIcon color="primary" />
      case 'error':
        return <ErrorIcon color="error" />
      default:
        return <DescriptionIcon />
    }
  }

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #ccc',
          '&:hover': {
            backgroundColor: '#f0f1f2',
            borderColor: 'primary.main',
          },
        }}
      >
        <input {...getInputProps()} />
        <AssignmentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Drop Documents Here
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Support for AADHAR Card, Utility Bills, and other KYC documents
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block">
          Accepted formats: JPG, PNG, PDF
        </Typography>
      </Paper>

      {processing && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      )}

      <List sx={{ mt: 2 }}>
        {documents.map((doc) => (
          <Card key={doc.id} sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <ListItemIcon>{getStatusIcon(doc.status)}</ListItemIcon>
                </Grid>
                <Grid item xs>
                  <ListItemText
                    primary={doc.file.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={doc.type}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {doc.status === 'completed' && (
                          <Chip
                            label={`${doc.confidence}% Confidence`}
                            size="small"
                            color={doc.confidence > 90 ? 'success' : 'warning'}
                          />
                        )}
                      </Box>
                    }
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => removeDocument(doc.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  )
}