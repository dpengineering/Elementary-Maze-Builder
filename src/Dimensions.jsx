// Dimensions (in inches)

export const TOTAL_WIDTH = 4.013;
export const CELLS_PER_COL = 16;
export const CELL_SIZE = TOTAL_WIDTH / CELLS_PER_COL;

export const BORDER_RADIUS = 0.115;
export const SCREW_HOLE_RADIUS = 0.116 / 2;
export const INTERIOR_FILLET_RADIUS = BORDER_RADIUS / 4;
export const EXTERIOR_FILLET_RADIUS = BORDER_RADIUS / 4;
export const SCREW_HOLE_OFFSET = 0.03075; // how far to move the screw hole along both x and y axes towards the center

export const FONT_SIZE = 0.14; // for the engraving text
export const TEXT_Y_OFFSET = 0.05; // fudge factor to center the text

// this is just for rendering the holes that will be in the baseplate
export const BALL_HOLE_RADIUS = CELL_SIZE * 0.4;


// color of anything being engraved
export const ENGRAVING_DISPLAY_COLOR = '#AAAAAA'; // grey
export const ENGRAVING_EXPORT_COLOR = 'red';

// Lego colors
export const BASEPLATE_COLORS = [
    // color, shadow, highlight
    ['#e62517', '#c01f15', '#eb2719'], // red
    ['#fd8016', '#e67314', '#ff8518'], // orange
    ['#ffd700', '#d1b700', '#ffdb04'], // yellow
    ['#586e01', '#4d5f01', '#5e7601'], // dark green
    ['#8aaf00', '#789900', '#8fb900'], // light green
    ['#32c5bb', '#2ba99f', '#36c9bf'], // turquoise
    ['#7dc2e9', '#6ba9c8', '#86caee'], // light blue
    ['#d553b3', '#ba49a0', '#db57b8'], // purple
    ['#b98ad0', '#a178b9', '#bf92d5'], // lilac
    ['#f0b8db', '#d8a3c3', '#f2bddf'], // pink
    ['#5a5a5a', '#4e4e4e', '#616161'], // dark grey
    ['#3a3a3a', '#323232', '#404040'], // black
];

export const BRICK_COLOR = ['#a7a7a7', '#919191', '#ababab']; // grey



