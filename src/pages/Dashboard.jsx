import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material'

export default function Dashboard() {
  const stats = [
    {
      title: 'Total Verifications',
      value: '1,234',
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    },
    {
      title: 'Pending Verification',
      value: '45',
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
    },
    {
      title: 'Verified Today',
      value: '23',
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
    },
    {
      title: 'Failed Verification',
      value: '12',
      icon: <WarningIcon sx={{ fontSize: 40, color: 'error.main' }} />,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      name: 'John Doe',
      status: 'Verified',
      time: '2 minutes ago',
      icon: <CheckCircleIcon color="success" />,
    },
    {
      id: 2,
      name: 'Jane Smith',
      status: 'Pending',
      time: '5 minutes ago',
      icon: <ScheduleIcon color="warning" />,
    },
    {
      id: 3,
      name: 'Mike Johnson',
      status: 'Failed',
      time: '10 minutes ago',
      icon: <WarningIcon color="error" />,
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4">{stat.value}</Typography>
                  </Box>
                  {stat.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id}>
                  <ListItemIcon>{activity.icon}</ListItemIcon>
                  <ListItemText
                    primary={activity.name}
                    secondary={`${activity.status} • ${activity.time}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}