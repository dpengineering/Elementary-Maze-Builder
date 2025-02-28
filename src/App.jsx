import { useState } from "react";
import './App.css';

// Dimensions (in inches)
const TOTAL_WIDTH = 3.95;
const CELLS_PER_COL = 16;
const CELL_SIZE = TOTAL_WIDTH / CELLS_PER_COL;

const BORDER_RADIUS = CELL_SIZE / 2;
const SCREW_HOLE_RADIUS = CELL_SIZE / 4;
// TODO Y'all can figure out what these values are exactly supposed to be
const INTERIOR_FILLET_RADIUS = CELL_SIZE / 8;
const EXTERIOR_FILLET_RADIUS = CELL_SIZE / 4;
const SCREW_HOLE_OFFSET = 0.01875; // how far to move the screw hole along both x and y axes towards the center

const FONT_SIZE = 0.13; // for the engraving text

const ENGRAVING_COLOR = '#AAAAAA'; // grey

// How wide we draw the cut lines.
// Probably irrelevant to the laser cutter but might matter
// if cutting mode set to fill
const STROKE_WIDTH = 0.01;

const DPI = 96; // pixels per inch



const MODE_BLOCKS = 0, MODE_OUTLINE = 1;

function escapeSpecialChars(text) {
  return text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export default function App() {
  const gridSize = 16; // Define the size of the grid (16x16)

  // Create the grid state: Border squares (1) and empty interior squares (0)
  const [grid, setGrid] = useState(
    Array(gridSize).fill().map((_, rowIndex) =>
      Array(gridSize).fill().map((_, colIndex) =>
        rowIndex === 0 || rowIndex === gridSize - 1 || colIndex === 0 || colIndex === gridSize - 1 ? 1 : 0
      )
    )
  );

  const [mode, setMode] = useState(MODE_BLOCKS);

  // Create a state to store text input for the top row
  const [topText, setTopText] = useState("<Your Name Here>");

  // Function to handle text input changes
  const handleTextChange = (event) => {
    let value = event.target.value.toUpperCase(); // Convert input to uppercase for consistency
    setTopText(value.slice(0,28)); // Limit input length to 45 characters to fit within the box without overflow
  };

  const renderProps = {
    showIssues: false,
    mode: mode,
  };

  return <div>
    <button onClick={() => downloadSVG(exportToSVG(grid, topText, { mode: MODE_OUTLINE }), topText)}>Export</button>
    <button onClick={() => setMode(MODE_BLOCKS)}>Show Blocks</button>
    <button onClick={() => setMode(MODE_OUTLINE)}>Show Outline</button>
    <input
      type="text"
      value={topText}
      onChange={handleTextChange}
    />
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: `20px auto`
    }}>
      <Grid
        grid={grid}
        setGrid={setGrid}
        topText={topText}
        renderProps={renderProps}
      />
    </div>
  </div>
}

function Grid(props) {
  const gridSize = props.grid.length;
  const grid = props.grid;
  const setGrid = props.setGrid;

  // Function to toggle the color of a square when clicked (black/white), except for perimeter cells
  const toggleCell = (row, col) => {
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) return; // Ignore border clicks

    // Create a new grid with the clicked cell toggled
    const newGrid = grid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? 1 - c : c))
    );
    props.setGrid(newGrid); // Update state with the modified grid
  };

  const [draggingMode, setDraggingMode] = useState(null);
  const onDown = (row, col) => {
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) {
      if (draggingMode == null) {
        setDraggingMode(1);
      }
    }
    toggleCell(row, col);
    setDraggingMode(1 - grid[row][col]);
  };

  const onMove = (row, col) => {
    if (draggingMode === null) {
      return;
    }
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
      return; // Ignore out-of-bounds clicks
    }
    if (grid[row][col] === draggingMode) {
      return; // Ignore if the cell is already in the desired state
    }
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) return; // Ignore border clicks

    // Create a new grid with the clicked cell toggled
    const newGrid = grid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? draggingMode : c))
    );
    setGrid(newGrid); // Update state with the modified grid
  };

  const onUp = () => {
    setDraggingMode(null);
  };

  const cellSizePixels = CELL_SIZE * DPI;

  const getCoord = (e) => {
    let rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let row = Math.floor(y / cellSizePixels);
    let col = Math.floor(x / cellSizePixels);
    return [row, col];
  }

  return <div
    className="noselect">
    <img
      draggable="false"
      src={"data:image/svg+xml ;charset=utf-8," + encodeURIComponent(exportToSVG(grid, props.topText, props.renderProps))} alt="SVG Preview"
      onPointerDown={(e) => onDown(...getCoord(e))}
      onPointerMove={(e) => onMove(...getCoord(e))}
      onPointerUp={onUp}
    /></div>;

}

function exportToSVG(grid, text, renderProps) {

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

  let svgContent = `<svg
    xmlns="http://www.w3.org/2000/svg"
      width="${TOTAL_WIDTH}in"
      height="${TOTAL_WIDTH}in"
      viewBox="0 0 ${TOTAL_WIDTH} ${TOTAL_WIDTH}"
    ><g stroke-width="${STROKE_WIDTH}" ${styleContent}>`;

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
          let fill = 'none';
          if (renderProps.mode === MODE_BLOCKS) {
            fill = totalRotation < 0 ? 'black' : 'white';
            if (renderProps.showIssues && totalRotation < 0 && isIsland) {
              fill = 'blue';
            }
          }
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
  const screwHoleStyle = renderProps.mode === MODE_BLOCKS ? `fill="white" stroke="none"` : `fill="none" stroke="black"`;
  svgContent += `
    <g ${screwHoleStyle}>
      <circle cx="${circleOffset}" cy="${circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Top-left -->
      <circle cx="${TOTAL_WIDTH - circleOffset}" cy="${circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Top-right -->
      <circle cx="${circleOffset}" cy="${TOTAL_WIDTH - circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Bottom-left -->
      <circle cx="${TOTAL_WIDTH - circleOffset}" cy="${TOTAL_WIDTH - circleOffset}" r="${SCREW_HOLE_RADIUS}"/> <!-- Bottom-right -->
    </g>
  `;

  svgContent += `<text x="${TOTAL_WIDTH / 2}" y="${CELL_SIZE / 2}" dominant-baseline="middle" text-anchor="middle" fill="${ENGRAVING_COLOR}" stroke="none" font-size="${FONT_SIZE}" font-family="Sans,Arial">${escapeSpecialChars(text)}</text>`

  svgContent += `</g></svg>`;

  return svgContent
}

function downloadSVG(svgContent, nameText) {
  // Create and trigger the download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze_"+ nameText +".svg";
  link.click();
}