import { useState } from "react";
import * as D from './Dimensions';
import { exportToSVG } from './rendering';

import { MODE_BRICKS } from './App';

const DPI = 96; // pixels per inch

export function Grid(props) {
    const gridSize = props.grid.length;
    const grid = props.grid;
    const setGrid = props.setGrid;

    // Function to toggle the color of a square when clicked (black/white), except for perimeter cells
    const toggleCell = (row, col, color) => {
        if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) return; // Ignore border clicks

        // Create a new grid with the clicked cell toggled
        const newGrid = grid.map((r, i) =>
            r.map((c, j) => (i === row && j === col ? color : c))
        );
        props.setGrid(newGrid); // Update state with the modified grid
    };

    const [draggingMode, setDraggingMode] = useState(null);
    const onDown = (row, col) => {
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            return; // Ignore out-of-bounds clicks
        }
        if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) {
            if (props.renderProps.mode === MODE_BRICKS) {
                if (draggingMode === null) {
                    setDraggingMode(1);
                    return;
                }
            } else {
                if (row === 0 && col > 0 && col < gridSize - 1) {
                    props.setSelectedEngraving(0);
                } else if (col === gridSize - 1 && row > 0 && row < gridSize - 1) {
                    props.setSelectedEngraving(1);
                } else if (row === gridSize - 1 && col > 0 && col < gridSize - 1) {
                    props.setSelectedEngraving(2);
                } else if (col === 0 && row > 0 && row < gridSize - 1) {
                    props.setSelectedEngraving(3);
                }
                return;
            }
        }
        props.setSelectedEngraving(null);
        const newColor = grid[row][col] ? 0 : 1;
        toggleCell(row, col, newColor);
        setDraggingMode(newColor);
    };

    const onMove = (row, col) => {
        if (draggingMode === null) {
            return;
        }
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            return; // Ignore out-of-bounds clicks
        }
        if (grid[row][col] && draggingMode || !grid[row][col] && !draggingMode) {
            return; // Ignore if the cell is already in the desired state
        }
        if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) return; // Ignore border clicks

        const newColor = draggingMode ? 1 : 0;
        // Create a new grid with the clicked cell toggled
        const newGrid = grid.map((r, i) =>
            r.map((c, j) => (i === row && j === col ? newColor : c))
        );
        setGrid(newGrid); // Update state with the modified grid
    };

    const onUp = () => {
        setDraggingMode(null);
    };

    const cellSizePixels = D.CELL_SIZE * DPI * props.renderProps.zoom;

    const getCoord = (e) => {
        let rect = e.currentTarget.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        let row = Math.floor(y / cellSizePixels);
        let col = Math.floor(x / cellSizePixels);
        return [row, col];
    }

    return <div
        id="grid"
        className="noselect">
        <img
            draggable="false"
            src={"data:image/svg+xml ;charset=utf-8," + encodeURIComponent(exportToSVG(grid, props.engravings, props.renderProps))} alt="SVG Preview"
            onPointerDown={(e) => onDown(...getCoord(e))}
            onPointerMove={(e) => onMove(...getCoord(e))}
            onPointerUp={onUp}
            ref={props.gridRef}
        /></div>;
}