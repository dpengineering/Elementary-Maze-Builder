// Dimensions (in inches)

export const TOTAL_WIDTH = 3.95;
export const CELLS_PER_COL = 16;
export const CELL_SIZE = TOTAL_WIDTH / CELLS_PER_COL;

export const BORDER_RADIUS = CELL_SIZE / 2;
export const SCREW_HOLE_RADIUS = CELL_SIZE / 4;
// TODO Y'all can figure out what these values are exactly supposed to be
export const BALL_HOLE_RADIUS = CELL_SIZE * 0.4;
export const INTERIOR_FILLET_RADIUS = CELL_SIZE / 6;
export const EXTERIOR_FILLET_RADIUS = CELL_SIZE / 10;
export const SCREW_HOLE_OFFSET = 0.01875; // how far to move the screw hole along both x and y axes towards the center

export const FONT_SIZE = 0.13; // for the engraving text

export const ENGRAVING_COLOR = '#AAAAAA'; // grey