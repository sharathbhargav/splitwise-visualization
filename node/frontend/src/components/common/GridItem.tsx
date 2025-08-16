/**
 * Utility Grid component to work around TypeScript strict type checking
 */
import { Grid, GridProps } from '@mui/material';
import React from 'react';

interface GridItemProps extends Omit<GridProps, 'item'> {
  item?: boolean;
  xs?: number | boolean;
  sm?: number | boolean;
  md?: number | boolean;
  lg?: number | boolean;
  xl?: number | boolean;
}

export const GridItem: React.FC<GridItemProps> = (props) => {
  return <Grid {...(props as any)} />;
};

export { Grid as GridContainer } from '@mui/material';
