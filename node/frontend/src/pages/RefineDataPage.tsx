import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreGroupEditor } from '../components/StoreGroupEditor';
import { getStoreGroupings, applyStoreMappings } from '../services/api';
import { StoreGrouping } from '../types';

export const RefineDataPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<StoreGrouping[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadStoreGroupings();
  }, []);

  const loadStoreGroupings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getStoreGroupings();
      setGroups(response.suggestions);
    } catch (err) {
      setError('Error loading store groupings. Please try uploading your file again.');
      console.error('Error loading store groupings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = (oldName: string, newGroup: StoreGrouping) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.canonicalName === oldName ? newGroup : group
      )
    );
  };

  const handleDeleteGroup = (canonicalName: string) => {
    setGroups(prevGroups =>
      prevGroups.filter(group => group.canonicalName !== canonicalName)
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Convert groups to the format expected by the API
      const mappings: { [key: string]: string[] } = {};
      groups.forEach(group => {
        mappings[group.canonicalName] = group.variations;
      });

      await applyStoreMappings(mappings);
      navigate('/dashboard');
    } catch (err) {
      setError('Error saving store mappings. Please try again.');
      console.error('Error saving store mappings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Refine Store Names
      </Typography>
      <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
        Review and edit the suggested store name groupings below
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={2} sx={{ mt: 4, mb: 4 }}>
        {groups.map(group => (
          <StoreGroupEditor
            key={group.canonicalName}
            group={group}
            onUpdate={handleUpdateGroup}
            onDelete={handleDeleteGroup}
          />
        ))}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          size="large"
        >
          {isSaving ? 'Saving...' : 'Confirm & View Dashboard'}
        </Button>
      </Box>
    </Box>
  );
};
