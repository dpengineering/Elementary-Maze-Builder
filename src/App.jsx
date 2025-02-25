import { useState } from "react";

export default function App() {
    // Define the size of the grid (16x16) and the dimensions of each square
    const gridSize = 16;
    const cellSize = 40; // Each square is 40x40 pixels
    const circleSize = cellSize / 2; // White circles are half the size of a cell
    
    // Define offsets to ensure white circles are positioned correctly in the corners
    const circleOffsets = {
        topLeft: { x: 3, y: 3 },
        topRight: { x: -3, y: 3 },
        bottomLeft: { x: 3, y: -3 },
        bottomRight: { x: -3, y: -3 }
    };

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
                        // Define rounded corners for the border
                        let borderRadius = "0";
                        if (rowIndex === 0 && colIndex === 0) borderRadius = `50% 0 0 0`; // Top-left corner
                        if (rowIndex === 0 && colIndex === gridSize - 1) borderRadius = `0 50% 0 0`; // Top-right corner
                        if (rowIndex === gridSize - 1 && colIndex === 0) borderRadius = `0 0 0 50%`; // Bottom-left corner
                        if (rowIndex === gridSize - 1 && colIndex === gridSize - 1) borderRadius = `0 0 50% 0`; // Bottom-right corner
                        
                        // Skip rendering squares for the top row since it's now a single text box
                        if (rowIndex === 0 && colIndex > 0 && colIndex < gridSize - 1) return null;
                        
                        return (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => toggleCell(rowIndex, colIndex)} // Handle square clicks
                                style={{
                                    width: cellSize,
                                    height: cellSize,
                                    backgroundColor: cell ? "black" : "white", // Set square color
                                    cursor: rowIndex === 0 || rowIndex === gridSize - 1 || colIndex === 0 || colIndex === gridSize - 1 ? "default" : "pointer", // Only allow clicking inside
                                    borderRadius: borderRadius,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative"
                                }}
                            >
                                {/* Render white circles in the four corners */}
                                {((rowIndex === 0 && colIndex === 0) || (rowIndex === 0 && colIndex === gridSize - 1) ||
                                  (rowIndex === gridSize - 1 && colIndex === 0) || (rowIndex === gridSize - 1 && colIndex === gridSize - 1)) && (
                                    <div
                                        style={{
                                            width: circleSize,
                                            height: circleSize,
                                            backgroundColor: "white",
                                            borderRadius: "50%", // Make circles perfectly round
                                            position: "absolute",
                                            left: `calc(50% + ${circleOffsets[rowIndex === 0 ? (colIndex === 0 ? "topLeft" : "topRight") : (colIndex === 0 ? "bottomLeft" : "bottomRight")].x}px)`,
                                            top: `calc(50% + ${circleOffsets[rowIndex === 0 ? (colIndex === 0 ? "topLeft" : "topRight") : (colIndex === 0 ? "bottomLeft" : "bottomRight")].y}px)`,
                                            transform: "translate(-50%, -50%)" // Center circles properly
                                        }}
                                    ></div>
                                )}
                            </div>
                        );
                    })
                )}
                {/* Single text input box replacing 14 individual squares */}
                <div
                    style={{
                        gridColumn: "2 / 16", // Stretch across columns 2 to 15
                        gridRow: "1", // Stay in the first row
                        width: `${cellSize * 14}px`, // Set total width equivalent to 14 cells
                        height: `${cellSize}px`, // Keep the height of one cell
                        backgroundColor: "black", // Match border color
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <input
                        type="text"
                        value={topText}
                        onChange={handleTextChange}
                        style={{
                            width: "100%",
                            height: "100%",
                            textAlign: "center",
                            fontSize: `${cellSize / 3}px`, // Set font size to be 1/3 of cell size
                            textTransform: "uppercase", // Ensure all letters are uppercase
                            border: "none", // Remove input border
                            background: "transparent", // Make input blend into the black box
                            color: "white", // Set text color to white
                            outline: "none", // Remove focus outline
                            caretColor: "white" // Make cursor color white
                        }}
                    />
                </div>
            </div>
        </div>
    );
}