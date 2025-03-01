import { MODE_OUTLINE, MODE_FILLED } from './App';
import {TOTAL_WIDTH, CELL_SIZE, BORDER_RADIUS, SCREW_HOLE_RADIUS, BALL_HOLE_RADIUS, INTERIOR_FILLET_RADIUS, EXTERIOR_FILLET_RADIUS, SCREW_HOLE_OFFSET, FONT_SIZE, ENGRAVING_COLOR} from './Dimensions';
// How wide we draw the cut lines.
// Probably irrelevant to the laser cutter but might matter
// if cutting mode set to fill
const STROKE_WIDTH = 0.01;

function escapeSpecialChars(text) {
  return text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function exportToSVG(grid, text, renderProps) {
    let designHasErrors = false;
    const wallsVertical = Array(grid.length - 2).fill().map((_, rowIndex) =>
      Array(grid[0].length - 1).fill().map((_, colIndex) => {
        const row = rowIndex + 1; // skipping row 1 because it's the border
        const column = colIndex;
        const cell1 = grid[row][column];
        const cell2 = grid[row][column + 1];
        return cell1 !== cell2; // true if there's a vertical wall
      })
    );
  
    const wallsHorizontal = Array(grid.length - 1).fill().map((_, rowIndex) =>
      Array(grid[0].length - 2).fill().map((_, colIndex) => {
        const row = rowIndex;
        const column = colIndex + 1; // skipping column 1 because it's the border
        const cell1 = grid[row][column];
        const cell2 = grid[row + 1][column];
        return cell1 !== cell2; // true if there's a horizontal wall
      })
    );
  
    const styleContent = renderProps.mode === MODE_OUTLINE ? `fill="none" stroke="black"` : `fill="black" stroke="none"`;
  
    if (renderProps.zoom == null) {
      renderProps.zoom = 1;
    }
  
    const zoomedWidth = TOTAL_WIDTH * renderProps.zoom;
  
    let svgContent = `<svg
      xmlns="http://www.w3.org/2000/svg"
        width="${zoomedWidth}in"
        height="${zoomedWidth}in"
        viewBox="0 0 ${zoomedWidth} ${zoomedWidth}"
      ><g transform="scale(${renderProps.zoom})" stroke-width="${STROKE_WIDTH}" ${styleContent}>`;
  
    // outer walls  
    svgContent += `
      <path d="
        M ${BORDER_RADIUS} 0 
        H ${TOTAL_WIDTH - BORDER_RADIUS} 
        A ${BORDER_RADIUS} ${BORDER_RADIUS} 0 0 1 ${TOTAL_WIDTH} ${BORDER_RADIUS} 
        V ${TOTAL_WIDTH - BORDER_RADIUS} 
        A ${BORDER_RADIUS} ${BORDER_RADIUS} 0 0 1 ${TOTAL_WIDTH - BORDER_RADIUS} ${TOTAL_WIDTH} 
        H ${BORDER_RADIUS} 
        A ${BORDER_RADIUS} ${BORDER_RADIUS} 0 0 1 0 ${TOTAL_WIDTH - BORDER_RADIUS} 
        V ${BORDER_RADIUS} 
        A ${BORDER_RADIUS} ${BORDER_RADIUS} 0 0 1 ${BORDER_RADIUS} 0 
        Z
      "/>`;
  
    const visitedRight = Array(grid.length).fill().map((_, __) =>
      Array(grid[0].length).fill(false)
    );
    const visitedLeft = Array(grid.length).fill().map((_, __) =>
      Array(grid[0].length).fill(false)
    );
    const TOP = 0, RIGHT = 1, BOTTOM = 2, LEFT = 3;
  
    const hasEdge = (row, col, edge) => {
      switch ((edge + 4) % 4) {
        case TOP:
          return wallsHorizontal[row - 1][col - 1];
        case RIGHT:
          return wallsVertical[row - 1][col];
        case BOTTOM:
          return wallsHorizontal[row][col - 1];
        case LEFT:
          return wallsVertical[row - 1][col - 1];
      }
    }
  
    const dRow = (dir) => {
      switch (dir) {
        case LEFT:
          return 0;
        case RIGHT:
          return 0;
        case TOP:
          return -1;
        case BOTTOM:
          return 1;
      }
    }
  
    const dCol = (dir) => {
      switch (dir) {
        case LEFT:
          return -1;
        case RIGHT:
          return 1;
        case TOP:
          return 0;
        case BOTTOM:
          return 0;
      }
    }
  
    const tracePath = (row, col, initialDir) => {
      svgContent += `
            <path d="M ${col * CELL_SIZE + CELL_SIZE / 2} ${(initialDir === RIGHT ? row : row + 1) * CELL_SIZE}`;
      let dir = initialDir; // the direction we are trying to go next
      let isIsland = true;
      let totalRotation = 0;
      while (true) {
        if (dir === RIGHT || dir === LEFT) {
          if (dir === RIGHT && visitedRight[row][col] || dir === LEFT && visitedLeft[row][col]) {
            // we have already visited this cell, so we are done
            let fill = totalRotation < 0 ? 'black' : 'white';
            if (totalRotation < 0 && isIsland) {
              designHasErrors = true;
              if (renderProps.showIssues)
                fill = 'blue';
            }
            if (renderProps.mode === MODE_OUTLINE)
              fill = 'none';
            svgContent += `Z" style="fill:${fill};"/>`; // close path
            return;
          }
          if (dir === RIGHT)
            visitedRight[row][col] = true;
          else
            visitedLeft[row][col] = true;
        }
  
  
  
        // coordinates for a line, which change depending which edge we're following
        const colPos = ((dir === RIGHT || dir === BOTTOM) ? col + 1 : col);
        const rowPos = ((dir === BOTTOM || dir === LEFT) ? row + 1 : row);
  
        if (colPos === 1 || colPos === grid[0].length - 1 || rowPos === 1 || rowPos === grid.length - 1) {
          isIsland = false;
        }
  
        const x = colPos * CELL_SIZE;
        const y = rowPos * CELL_SIZE;
  
        // figure out if edge continues straight, or has an interior corner, or an exterior corner
        if (hasEdge(row, col, dir)) {
          // interior angle case
          const r = INTERIOR_FILLET_RADIUS;
          svgContent += `L ${x - dCol(dir) * r} ${y - dRow(dir) * r}`;
          dir = (dir + 1) % 4;
          totalRotation++;
          svgContent += `A ${r} ${r} 0 0 1 ${x + dCol(dir) * r} ${y + dRow(dir) * r}`;
        } else {
          let nextRow = row + dRow(dir);
          let nextCol = col + dCol(dir);
          if (hasEdge(nextRow, nextCol, dir - 1)) {
            // straight case
            // do nothing and let the line continue
          } else {
            // exterior angle case
            const r = EXTERIOR_FILLET_RADIUS;
            svgContent += `L ${x - dCol(dir) * r} ${y - dRow(dir) * r}`;
            dir = (dir + 4 - 1) % 4;
            totalRotation--;
            svgContent += `A ${r} ${r} 0 0 0 ${x + dCol(dir) * r} ${y + dRow(dir) * r}`;
            nextRow += dRow(dir);
            nextCol += dCol(dir);
          }
          row = nextRow;
          col = nextCol;
        }
      }
    }
  
    // try to start following an edge at every place an edge might start
    for (let row = 1; row < grid.length - 1; row++) {
      for (let col = 1; col < grid[0].length - 1; col++) {
        if (!grid[row][col]) {
          if (!visitedRight[row][col] && hasEdge(row, col, TOP)) {
            tracePath(row, col, RIGHT);
          }
          if (!visitedLeft[row][col] && hasEdge(row, col, BOTTOM)) {
            tracePath(row, col, LEFT);
          }
        }
      }
    }
  
    // Add white circles inside the four corner cells
    const circleOffset = CELL_SIZE / 2 + SCREW_HOLE_OFFSET;
    const screwHoleStyle = renderProps.mode === MODE_FILLED ? `fill="white" stroke="none"` : `fill="none" stroke="black"`;
    svgContent += `
      <g ${screwHoleStyle}>
        <circle cx="${circleOffset}" cy="${circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Top-left -->
        <circle cx="${TOTAL_WIDTH - circleOffset}" cy="${circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Top-right -->
        <circle cx="${circleOffset}" cy="${TOTAL_WIDTH - circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Bottom-left -->
        <circle cx="${TOTAL_WIDTH - circleOffset}" cy="${TOTAL_WIDTH - circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Bottom-right -->
      </g>
    `;
  
      // Add holes at the start and end
      const holes = [[1,1], [grid.length - 2, grid[0].length - 2]];
      for (let hole of holes) {
        const [row, col] = hole;
        const isCovered = grid[row][col];
        designHasErrors ||= isCovered;
        if (isCovered && !renderProps.showIssues) {
          continue;
        }
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = row * CELL_SIZE + CELL_SIZE / 2;
        const color =  isCovered ? 'blue' : '#CCCCCC';
        if (renderProps.mode === MODE_FILLED)
          svgContent += `<circle cx="${x}" cy="${y}" r="${BALL_HOLE_RADIUS}" fill="none" stroke="${color}"/>`;
      }
  
      // look for bad diagonals
      if (renderProps.validateDesign || renderProps.showIssues) {
        for (let row = 1; row < grid.length - 2; row++) {
          for (let col = 1; col < grid[0].length - 2; col++) {
            if (grid[row][col] && grid[row + 1][col + 1] && !grid[row + 1][col] && !grid[row][col + 1] ||
                !grid[row][col] && !grid[row + 1][col + 1] && grid[row + 1][col] && grid[row][col + 1]
            ) {
              designHasErrors = true;
              if (renderProps.showIssues) {
                const warningSize = CELL_SIZE / 2;
                const x = col * CELL_SIZE + CELL_SIZE - warningSize / 2;
                const y = row * CELL_SIZE + CELL_SIZE - warningSize / 2;
                svgContent += `<rect x="${x}" y="${y}" width="${warningSize}" height="${warningSize}" fill="none" stroke="blue"/>`;
              }
          }
        }
      }
    }
    
  
    svgContent += `<text x="${TOTAL_WIDTH / 2}" y="${CELL_SIZE / 2}" dominant-baseline="middle" text-anchor="middle" fill="${ENGRAVING_COLOR}" stroke="none" font-size="${FONT_SIZE}" font-family="Sans,Arial">${escapeSpecialChars(text)}</text>`
  
    svgContent += `</g></svg>`;
    if (renderProps.validateDesign && designHasErrors) {
      return null;
    }
    return svgContent
  }