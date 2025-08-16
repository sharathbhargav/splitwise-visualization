import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { AnalysisFilters, DatasetMetadata } from '../../types';
import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';

interface Props {
  metadata: DatasetMetadata;
  onFiltersChange: (filters: AnalysisFilters) => void;
}

/**
 * Component for filtering dashboard data
 * Includes date range, people, categories, and stores filters
 */
export const Filters = ({ metadata, onFiltersChange }: Props) => {
  const [startDate, setStartDate] = useState<Date | null>(
    metadata.dateRange.start ? parseISO(metadata.dateRange.start) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    metadata.dateRange.end ? parseISO(metadata.dateRange.end) : null
  );
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);

  useEffect(() => {
    onFiltersChange({
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      people: selectedPeople.length > 0 ? selectedPeople : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      stores: selectedStores.length > 0 ? selectedStores : undefined
    });
  }, [startDate, endDate, selectedPeople, selectedCategories, selectedStores]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Box>

          <FormControl fullWidth>
            <InputLabel>People</InputLabel>
            <Select
              multiple
              value={selectedPeople}
              onChange={e => setSelectedPeople(e.target.value as string[])}
              renderValue={selected => selected.join(', ')}
            >
              {metadata.people.map(person => (
                <MenuItem key={person} value={person}>
                  {person}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={selectedCategories}
              onChange={e => setSelectedCategories(e.target.value as string[])}
              renderValue={selected => selected.join(', ')}
            >
              {metadata.categories.map(category => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Stores</InputLabel>
            <Select
              multiple
              value={selectedStores}
              onChange={e => setSelectedStores(e.target.value as string[])}
              renderValue={selected => selected.join(', ')}
            >
              {metadata.stores.map(store => (
                <MenuItem key={store} value={store}>
                  {store}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
};
