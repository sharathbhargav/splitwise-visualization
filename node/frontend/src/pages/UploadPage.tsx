import { Box, Typography } from '@mui/material';
import { FileUpload } from '../components/FileUpload';

export const UploadPage = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Upload Your Spending Data
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        Upload a CSV file containing your spending data to analyze your expenses
      </Typography>
      <FileUpload />
    </Box>
  );
};
