// Dimensions (in inches)

export const TOTAL_WIDTH = 4.05;
export const CELLS_PER_COL = 16;
export const CELL_SIZE = TOTAL_WIDTH / CELLS_PER_COL;

export const BORDER_RADIUS = 0.115;
export const SCREW_HOLE_RADIUS = 0.116 / 2;
export const INTERIOR_FILLET_RADIUS = BORDER_RADIUS / 4;
export const EXTERIOR_FILLET_RADIUS = BORDER_RADIUS / 4;
export const SCREW_HOLE_OFFSET = 0.01875; // how far to move the screw hole along both x and y axes towards the center

export const FONT_SIZE = 0.14; // for the engraving text
export const TEXT_Y_OFFSET = 0.05; // fudge factor to center the text

// this is just for rendering the holes that will be in the baseplate
export const BALL_HOLE_RADIUS = CELL_SIZE * 0.4;


// color of anything being engraved
export const ENGRAVING_COLOR = '#AAAAAA'; // grey
