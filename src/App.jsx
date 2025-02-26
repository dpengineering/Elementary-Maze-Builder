import { useState } from "react";
import './App.css';

// Define offsets to ensure white circles are positioned correctly in the corners
const CIRCLE_OFFSETS = {
  topLeft: { x: 3, y: 3 },
  topRight: { x: -3, y: 3 },
  bottomLeft: { x: 3, y: -3 },
  bottomRight: { x: -3, y: -3 }
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

  // Create a state to store text input for the top row
  const [topText, setTopText] = useState("");

  // Function to handle text input changes
  const handleTextChange = (event) => {
    const value = event.target.value.toUpperCase(); // Convert input to uppercase for consistency
    setTopText(value.slice(0, 45)); // Limit input length to 45 characters to fit within the box without overflow
  };

  // Function to toggle the color of a square when clicked (black/white), except for perimeter cells
  const toggleCell = (row, col) => {
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) return; // Ignore border clicks

    // Create a new grid with the clicked cell toggled
    const newGrid = grid.map((r, i) =>
      r.map((c, j) => (i === row && j === col ? 1 - c : c))
    );
    setGrid(newGrid); // Update state with the modified grid
  };

  // Render the grid and UI elements
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`, // Set column widths
        margin: `${cellSize * 2}px auto`, // Center the grid vertically
        width: `${gridSize * cellSize}px`, // Set total grid width
        position: "relative" // Ensure elements align correctly
      }}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            return <Cell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              rowIndex={rowIndex}
              colIndex={colIndex}
              gridSize={gridSize}
              toggleCell={toggleCell}
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
            value={topText}
            onChange={handleTextChange}
            style={{
              fontSize: `${cellSize / 3}px`, // Set font size to be 1/3 of cell size
            }}
          />
        </div>
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
      className="cell"
      onClick={() => props.toggleCell(rowIndex, colIndex)} // Handle square clicks
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