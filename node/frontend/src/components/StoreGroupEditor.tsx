import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Typography
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Save as SaveIcon } from '@mui/icons-material';
import { useState } from 'react';
import { StoreGrouping } from '../types';

interface Props {
  group: StoreGrouping;
  onUpdate: (oldName: string, newGroup: StoreGrouping) => void;
  onDelete: (canonicalName: string) => void;
}

/**
 * Component for editing a store name group
 * Allows editing the canonical name and managing variations
 */
export const StoreGroupEditor = ({ group, onUpdate, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.canonicalName);

  const handleSave = () => {
    if (editedName.trim() && editedName !== group.canonicalName) {
      onUpdate(group.canonicalName, {
        ...group,
        canonicalName: editedName.trim()
      });
    }
    setIsEditing(false);
  };

  const handleRemoveVariation = (variation: string) => {
    onUpdate(group.canonicalName, {
      ...group,
      variations: group.variations.filter(v => v !== variation)
    });
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {isEditing ? (
            <>
              <TextField
                size="small"
                value={editedName}
                onChange={e => setEditedName(e.target.value)}
                fullWidth
                autoFocus
                sx={{ mr: 1 }}
              />
              <IconButton onClick={handleSave} color="primary">
                <SaveIcon />
              </IconButton>
            </>
          ) : (
            <>
              <Typography variant="h6" sx={{ flex: 1 }}>
                {group.canonicalName}
              </Typography>
              <IconButton onClick={() => setIsEditing(true)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(group.canonicalName)} color="error">
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {group.variations.map(variation => (
            <Chip
              key={variation}
              label={variation}
              onDelete={() => handleRemoveVariation(variation)}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};
