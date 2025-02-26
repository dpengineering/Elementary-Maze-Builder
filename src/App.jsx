import { useState } from "react";
import './App.css';

// Define offsets to ensure white circles are positioned correctly in the corners
const C_OFF = 3;
const CIRCLE_OFFSETS = {
  topLeft: { x: C_OFF, y: C_OFF },
  topRight: { x: -C_OFF, y: C_OFF },
  bottomLeft: { x: C_OFF, y: -C_OFF },
  bottomRight: { x: -C_OFF, y: -C_OFF }
};

// dimensions of each square
const cellSize = 40; // Each square is 40x40 pixels
const circleSize = cellSize / 2; // White circles are half the size of a cell

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

  const [showSVG, setShowSVG] = useState(false);

  // Create a state to store text input for the top row
  const [topText, setTopText] = useState("");

  // Function to handle text input changes
  const handleTextChange = (event) => {
    const value = event.target.value.toUpperCase(); // Convert input to uppercase for consistency
    setTopText(value.slice(0, 45)); // Limit input length to 45 characters to fit within the box without overflow
  };

  return <div>
    <button onClick={() => downloadSVG(exportToSVG(grid, topText))}>Export</button>
    {/*for testing svg without downloading every time*/}
    <button onClick={() => setShowSVG(!showSVG)}>{showSVG ? 'Show Blocks' : 'Show Outline'}</button>
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      margin: `20px auto`
    }}>
    {showSVG ?
    <img
  src={"data:image/svg+xml ;charset=utf-8," + encodeURIComponent(exportToSVG(grid, topText))} alt="SVG Preview" /> :
    <Grid
      grid={grid}
      setGrid={setGrid}
      topText={topText}
      handleTextChange={handleTextChange}
    />}
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

  const onEnter = (row, col) => {
    if (draggingMode === null) {
      return;
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

  // Render the grid and UI elements
  return (
      <div
      onPointerUp={onUp}
       style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, // Set column widths
        width: `${gridSize * cellSize}px`, // Set total grid width
        position: "relative" // Ensure elements align correctly
      }}>
        {props.grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              rowIndex={rowIndex}
              colIndex={colIndex}
              gridSize={gridSize}
              toggleCell={toggleCell}
              onDown={onDown}
              onEnter={onEnter}
            />;
          })
        )}
        {/* Single text input box replacing 14 individual squares */}
        <div
          id="textDiv"
          style={{
            width: `${cellSize * (gridSize - 2)}px`, // Set total width equivalent to 14 cells
            height: `${cellSize}px`, // Keep the height of one cell
          }}
        >
          <input
            type="text"
            value={props.topText}
            onChange={props.handleTextChange}
            style={{
              fontSize: `${cellSize / 3}px`, // Set font size to be 1/3 of cell size
            }}
          />
        </div>
      </div>
  );
}

function Cell(props) {
  const rowIndex = props.rowIndex;
  const colIndex = props.colIndex;
  const isTopEdge = rowIndex === 0;
  const isBottomEdge = rowIndex === props.gridSize - 1;
  const isLeftEdge = colIndex === 0;
  const isRightEdge = colIndex === props.gridSize - 1;

  // Define rounded corners for the border
  let borderRadius = "0";
  if (isLeftEdge && isTopEdge) borderRadius = `50% 0 0 0`; // Top-left corner
  if (isRightEdge && isTopEdge) borderRadius = `0 50% 0 0`; // Top-right corner
  if (isLeftEdge && isBottomEdge) borderRadius = `0 0 0 50%`; // Bottom-left corner
  if (isRightEdge && isBottomEdge) borderRadius = `0 0 50% 0`; // Bottom-right corner

  // Skip rendering squares for the top row since it's now a single text box
  if (isTopEdge && !isLeftEdge && !isRightEdge) return null;

  // Render white circles in the four corners
  let circleElement = null;
  if ((isTopEdge && isLeftEdge) || (isTopEdge && isRightEdge) ||
    (isBottomEdge && isLeftEdge) || (isBottomEdge && isRightEdge)) {
    const circleOffset = CIRCLE_OFFSETS[isTopEdge ? (isLeftEdge ? "topLeft" : "topRight") : (isLeftEdge ? "bottomLeft" : "bottomRight")];
    circleElement =
      <div
        className="circle"
        style={{
          width: circleSize,
          height: circleSize,
          left: `calc(50% + ${circleOffset.x}px)`,
          top: `calc(50% + ${circleOffset.y}px)`,
        }}
      ></div>;
  }

  return (
    <div
      className="cell noselect"
      // onClick={() => props.toggleCell(rowIndex, colIndex)} // Handle square clicks
      onPointerDown={() => props.onDown(rowIndex, colIndex)}
      onPointerEnter={() => props.onEnter(rowIndex, colIndex)}
      style={{
        width: cellSize,
        height: cellSize,
        backgroundColor: props.cell ? "black" : "white", // Set square color
        cursor: isTopEdge || isBottomEdge || isLeftEdge || isRightEdge ? "default" : "pointer", // Only allow clicking inside
        borderRadius: borderRadius,
      }}
    >
      {circleElement}
    </div>
  );
}

function exportToSVG(grid, text) {
  const svgWidth = grid.length * cellSize;
  const svgHeight = grid[0].length * cellSize;
  const borderRadius = cellSize / 2;

  const strokeWidth = 2; // presumably the laser cutter doesn't care about this and it's just for display

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
  const style = `fill:none;stroke-width=${strokeWidth};stroke:black`;
  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;

  // outer walls  
  svgContent += `
    <path d="
      M ${borderRadius} 0 
      H ${svgWidth - borderRadius} 
      A ${borderRadius} ${borderRadius} 0 0 1 ${svgWidth} ${borderRadius} 
      V ${svgHeight - borderRadius} 
      A ${borderRadius} ${borderRadius} 0 0 1 ${svgWidth - borderRadius} ${svgHeight} 
      H ${borderRadius} 
      A ${borderRadius} ${borderRadius} 0 0 1 0 ${svgHeight - borderRadius} 
      V ${borderRadius} 
      A ${borderRadius} ${borderRadius} 0 0 1 ${borderRadius} 0 
      Z
    " style="${style}"/>`;

  // corners
  let currentRow = [];
  let lastRow = [];

  for (let row = 0; row < grid.length - 1; row++) {
    for (let col = 0; col < grid[0].length - 1; col++) {

      let startX = null;
      let endX = null;

      let nextStartX = null;
      let nextEndX = null;

      let startY = null;
      let endY = null;

      let nextStartY = null;
      let nextEndY = null;

      if (row < grid.length - 2 && col < grid[0].length - 2) {
      const isInteriorAngle = grid[row+1][col+1];
      const radius = isInteriorAngle ? 7 : 15;

      // top left
      if (wallsHorizontal[row][col] && wallsVertical[row][col]) {
        const x = (col + 1) * cellSize;
        const y = (row + 1) * cellSize;
        startX = radius;
        startY = radius;
        svgContent += `
          <path d="
            M ${x} ${y + radius} 
            A ${radius} ${radius} 0 0 1 ${x + radius} ${y}
          " style="${style}"/>`;
      }
      // bottom left
      if (wallsHorizontal[row + 1][col] && wallsVertical[row][col]) {
        const x = (col + 1) * cellSize;
        const y = (row + 2) * cellSize;
        nextStartX = radius;
        endY = cellSize - radius;
        svgContent += `
          <path d="
            M ${x} ${y - radius}
            A ${radius} ${radius} 0 0 0 ${x + radius} ${y}
          " style="${style}"/>`;
      }
      // top right
      if (wallsHorizontal[row][col] && wallsVertical[row][col+1]) {
        const x = (col + 2) * cellSize;
        const y = (row + 1) * cellSize;
        endX = cellSize - radius;
        nextStartY = radius;
        svgContent += `
          <path d="
            M ${x- radius} ${y} 
            A ${radius} ${radius} 0 0 1 ${x} ${y + radius}
          " style="${style}"/>`;
      }
      // bottom right
      if (wallsHorizontal[row + 1][col] && wallsVertical[row][col+1]) {
        const x = (col + 2) * cellSize;
        const y = (row + 2) * cellSize;
        nextEndX = cellSize - radius;
        nextEndY = cellSize - radius;
        svgContent += `
          <path d="
            M ${x- radius} ${y} 
            A ${radius} ${radius} 0 0 0 ${x} ${y - radius}
          " style="${style}"/>`;
      }
    }
      function start(a,b) {
        if (a == null && b == null) {
          return 0;
        }
        if (a != null && b != null) {
          return Math.min(a,b);
        }
        return a != null ? a : b;
      }

      function end(a,b) {
        if (a == null && b == null) {
          return cellSize;
        }
        if (a != null && b != null) {
          return Math.max(a,b);
        }
        return a != null ? a : b;
      }

      if (row < grid.length - 2 && wallsVertical[row][col]) {
        const x = (col + 1) * cellSize;
        const y = (row + 1) * cellSize;
        startY = start(startY, currentRow.length > 0 ? currentRow[col- 1].startY : null);
        endY = end(endY, currentRow.length > 0 ? currentRow[col- 1].endY : null);
        svgContent += `<line x1="${x}" y1="${y + startY}" x2="${x}" y2="${y + endY}" style="${style}"/>`;
      }

      if (col < grid[0].length - 2 && wallsHorizontal[row][col]) {
        const x = (col + 1) * cellSize;
        const y = (row + 1) * cellSize;
        startX = start(startX, lastRow.length > 0 ? lastRow[col].startX : null);
        endX = end(endX, lastRow.length > 0 ? lastRow[col].endX : null);
        svgContent += `<line x1="${x + startX}" y1="${y}" x2="${x + endX}" y2="${y}" style="${style}"/>`;
      }

      currentRow.push({startX: nextStartX, endX: nextEndX, startY: nextStartY, endY: nextEndY});
    }
    lastRow = currentRow;
    currentRow = [];
  }

  // Add white circles inside the four corner cells
  const circleRadius = circleSize / 2;
  const circleOffset = cellSize / 2 + 3;

  svgContent += `
    <circle cx="${circleOffset}" cy="${circleOffset}" r="${circleRadius}" style="${style}"/> <!-- Top-left -->
    <circle cx="${svgWidth - circleOffset}" cy="${circleOffset}" r="${circleRadius}" style="${style}"/> <!-- Top-right -->
    <circle cx="${circleOffset}" cy="${svgHeight - circleOffset}" r="${circleRadius}" style="${style}"/> <!-- Bottom-left -->
    <circle cx="${svgWidth - circleOffset}" cy="${svgHeight - circleOffset}" r="${circleRadius}" style="${style}"/> <!-- Bottom-right -->
  `;

  svgContent += `<text x="50%" y="${cellSize / 2 + 2}" dominant-baseline="middle" text-anchor="middle" fill="none" stroke="red" font-size="25" font-family="Sans,Arial">${text}</text>`

  svgContent += `</svg>`;

  return svgContent
}

function downloadSVG(svgContent) {
  // Create and trigger the download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze.svg";
  link.click();
}