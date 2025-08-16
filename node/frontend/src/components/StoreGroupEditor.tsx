import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Checkbox
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Merge as MergeIcon,
  CallSplit as SplitIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useState } from 'react';
import { StoreGrouping } from '../types';

interface Props {
  group: StoreGrouping;
  allGroups: StoreGrouping[];
  onUpdate: (oldName: string, newGroup: StoreGrouping) => void;
  onDelete: (canonicalName: string) => void;
  onMerge: (group1: StoreGrouping, group2: StoreGrouping) => void;
  onSplit: (group: StoreGrouping, variationsToSplit: string[]) => void;
}

/**
 * Component for editing a store name group
 * Allows editing the canonical name, managing variations, merging groups, and splitting variations
 */
export const StoreGroupEditor = ({
  group,
  allGroups,
  onUpdate,
  onDelete,
  onMerge,
  onSplit
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(group.canonicalName);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StoreGrouping | null>(null);
  const [selectedVariations, setSelectedVariations] = useState<string[]>([]);

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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleMergeClick = () => {
    setMergeDialogOpen(true);
    handleMenuClose();
  };

  const handleSplitClick = () => {
    setSplitDialogOpen(true);
    handleMenuClose();
  };

  const handleMergeConfirm = () => {
    if (selectedGroup) {
      onMerge(group, selectedGroup);
      setMergeDialogOpen(false);
      setSelectedGroup(null);
    }
  };

  const handleSplitConfirm = () => {
    if (selectedVariations.length > 0) {
      onSplit(group, selectedVariations);
      setSplitDialogOpen(false);
      setSelectedVariations([]);
    }
  };

  const handleVariationToggle = (variation: string) => {
    setSelectedVariations(prev =>
      prev.includes(variation)
        ? prev.filter(v => v !== variation)
        : [...prev, variation]
    );
  };

  return (
    <>
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
                <IconButton onClick={handleMenuOpen}>
                  <MoreVertIcon />
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

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMergeClick}>
          <MergeIcon sx={{ mr: 1 }} /> Merge with another group
        </MenuItem>
        <MenuItem onClick={handleSplitClick} disabled={group.variations.length === 0}>
          <SplitIcon sx={{ mr: 1 }} /> Split variations
        </MenuItem>
      </Menu>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onClose={() => setMergeDialogOpen(false)}>
        <DialogTitle>Merge with another store group</DialogTitle>
        <DialogContent>
          <List>
            {allGroups
              .filter(g => g.canonicalName !== group.canonicalName)
              .map(g => (
                <ListItem
                  key={g.canonicalName}
                  onClick={() => setSelectedGroup(g)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: selectedGroup?.canonicalName === g.canonicalName ? 'action.selected' : 'inherit'
                  }}
                >
                  <ListItemText
                    primary={g.canonicalName}
                    secondary={g.variations.join(', ')}
                  />
                </ListItem>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleMergeConfirm}
            disabled={!selectedGroup}
            variant="contained"
          >
            Merge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Split Dialog */}
      <Dialog open={splitDialogOpen} onClose={() => setSplitDialogOpen(false)}>
        <DialogTitle>Split variations into new group</DialogTitle>
        <DialogContent>
          <List>
            {group.variations.map(variation => (
              <ListItem
                key={variation}
                component="div"
                onClick={() => handleVariationToggle(variation)}
                sx={{ cursor: 'pointer' }}
              >
                <Checkbox
                  checked={selectedVariations.includes(variation)}
                  onChange={() => handleVariationToggle(variation)}
                />
                <ListItemText primary={variation} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSplitDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSplitConfirm}
            disabled={selectedVariations.length === 0}
            variant="contained"
          >
            Split
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};