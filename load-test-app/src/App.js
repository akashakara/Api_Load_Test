import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Paper, Grid, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import Chart from 'chart.js/auto';

const App = () => {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('GET');
  const [numRequests, setNumRequests] = useState(100);
  const [concurrency, setConcurrency] = useState(10);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadTestRequest = {
      url,
      method,
      num_requests: numRequests,
      concurrency,
      body: '', 
    };

    try {
      const response = await fetch('http://localhost:8080/api/load-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loadTestRequest),
      });

      if (!response.ok) {
        throw new Error('Load test failed');
      }

      const data = await response.json();
      setResultData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error during load test:', error);
      setLoading(false);
    }
  };
//chart
  const chartData = {
    labels: resultData?.response_times.map((_, index) => `Req ${index + 1}`),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: resultData?.response_times,
        backgroundColor: 'rgba(75,192,192,0.2)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="left" gutterBottom>
          API Load Test
      </Typography>
      <Box mt={4}>
   

      <Paper elevation={3} sx={{ padding: 3, maxWidth: 500, margin: '0 auto' }}>
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="API URL" variant="outlined" value={url} onChange={(e) => setUrl(e.target.value)} required margin="normal" />
            <TextField fullWidth label="Request Method" variant="outlined" value={method} onChange={(e) => setMethod(e.target.value)} select SelectProps={{ native: true }} margin="normal">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </TextField>
            <TextField fullWidth label="Number of Requests" variant="outlined" type="number" value={numRequests} onChange={(e) => setNumRequests(Number(e.target.value))} margin="normal" />
            <TextField fullWidth label="Concurrency" variant="outlined" type="number" value={concurrency} onChange={(e) => setConcurrency(Number(e.target.value))} margin="normal" />
            <Box mt={2}><Button fullWidth variant="contained" color="primary" type="submit" disabled={loading}>{loading ? 'Loading...' : 'Start Load Test'}</Button></Box>
          </form>
        </Grid>
      </Grid>
    </Paper>


    {resultData && (
  <Box mt={4}>
    <Box  sx={{ display: 'flex', justifyContent: 'center', gap: 4, width: '100%', mt: 4, }} >
      <Box sx={{ flex: 1, maxWidth: '48%', height: 'calc(100vh - 240px)',  overflowY: 'auto', padding: 3, border: '1px solid #ddd', borderRadius: 2,  backgroundColor: '#fafafa',  }} >
        <Typography variant="h6" gutterBottom>
          Test Summary
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                <TableCell>Value</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow><TableCell>Successful Requests</TableCell><TableCell>{resultData.success_req}</TableCell></TableRow>
              <TableRow><TableCell>Failed Requests</TableCell><TableCell>{resultData.failed_req}</TableCell></TableRow>
              <TableRow><TableCell>Average Response Time (ms)</TableCell><TableCell>{resultData.average_time}</TableCell></TableRow>
              <TableRow><TableCell>Min Response Time (ms)</TableCell><TableCell>{resultData.min_time}</TableCell></TableRow>
              <TableRow><TableCell>Max Response Time (ms)</TableCell><TableCell>{resultData.max_time}</TableCell></TableRow>
              <TableRow><TableCell>Median Response Time (ms)</TableCell><TableCell>{resultData.median_time}</TableCell></TableRow>
              <TableRow><TableCell>90th Percentile (ms)</TableCell><TableCell>{resultData.percentile_90}</TableCell></TableRow>
              <TableRow><TableCell>Status Code 200</TableCell><TableCell>{resultData.status_codes["200"]}</TableCell></TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ flex: 1,maxWidth: '48%', height: 'calc(100vh - 240px)', overflowY: 'auto', padding: 3, border: '1px solid #ddd', borderRadius: 2,   backgroundColor: '#fafafa', }} >
        <Typography variant="h6" gutterBottom>
          Request Timeline (Duration)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Duration (ms)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData.timeline.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(entry.timestamp).toLocaleString()}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>



    <Box mt={4} width="100%">
      <Typography variant="h6" align="center" gutterBottom>
        Response Time Graph 
      </Typography>
      <Bar data={chartData} />
    </Box>
  </Box>
)}

      </Box>
    </Container>
  );
};

export default App;
