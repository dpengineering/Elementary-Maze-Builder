import { useEffect, useState, useRef} from "react";
import './App.css';

import iconOutline from './assets/outline.svg';
import iconBrick from './assets/bricks.svg';
import iconFilled from './assets/fill.svg';

import { exportToSVG } from './rendering';
import * as D from './Dimensions';


const DPI = 96; // pixels per inch

export const MODE_FILLED = 0, MODE_OUTLINE = 1, MODE_BRICKS = 2;

export default function App() {
  // Create the grid state: Border squares (1,2,3) and empty interior squares (0)
  const [grid, setGrid] = useState(
    Array(D.CELLS_PER_COL).fill().map((_, rowIndex) =>
      Array(D.CELLS_PER_COL).fill().map((_, colIndex) =>
        rowIndex === 0 || rowIndex === D.CELLS_PER_COL - 1 || colIndex === 0 || colIndex === D.CELLS_PER_COL - 1 ? 1 : 0
      )
    )
  );

  const [mode, setMode] = useState(MODE_FILLED);
  const [showIssues, setShowIssues] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(200);

  const intervalRef = useRef(0);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  // Create a state to store text input for the top row
  const [topText, setTopText] = useState("<Your Name Here>");

  // Function to handle text input changes
  const handleTextChange = (event) => {
    let value = event.target.value.toUpperCase(); // Convert input to uppercase for consistency
    setTopText(value.slice(0,28)); // Limit input length to 45 characters to fit within the box without overflow
  };

  const renderProps = {
    showIssues: showIssues,
    mode: mode,
    zoom: zoomPercent / 100,
  };

  const onExport = () => {
    const svg = exportToSVG(grid, topText, { mode: MODE_FILLED, validateDesign: true});
    if (svg == null) {
      setMode(MODE_FILLED);
      setShowIssues(true);
      clearInterval(intervalRef.current);
      let counter = 0;
      intervalRef.current = setInterval(() => {
        setShowIssues(counter % 2);
        counter++;
        if (counter === 7)
          clearInterval(intervalRef.current);
      }, 250);
    } else {
      downloadSVG(svg, topText);
    }
  };

  return <div>
    <div style={{ display: "flex", justifyContent: "space-between", margin: `20px auto` }}>
      <button onClick={onExport}>Export</button>
      <ModeSelector mode={mode} onChange={(event) => {
        setMode(parseInt(event.target.value));
        clearInterval(intervalRef.current);
        setShowIssues(false);
      }} />
      <input
        type="text"
        value={topText}
        onChange={handleTextChange}
      />
      <button onClick={() => {
        if (zoomPercent < 200) {
          setZoomPercent(zoomPercent + 50);
        } else {
          setZoomPercent(100);
        }
      }}>Zoom {zoomPercent}%</button>
    </div>
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

function ModeSelector(props) {
  return <div className="mode-container"><div className="mode">
    <label htmlFor="outlineIcon">
      <input type="radio" name="mode" className="outlineIcon" id="outlineIcon" value={MODE_OUTLINE} checked={props.mode == MODE_OUTLINE} onChange={props.onChange} />
      <img src={iconOutline} />
    </label>

    <label htmlFor="filledIcon">
      <input type="radio" name="mode" className="filledIcon" id="filledIcon" value={MODE_FILLED} checked={props.mode == MODE_FILLED} onChange={props.onChange} />
      <img src={iconFilled} />
    </label>

    <label htmlFor="brickIcon">
      <input type="radio" name="mode" className="brickIcon" id="brickIcon" value={MODE_BRICKS} checked={props.mode == MODE_BRICKS} onChange={props.onChange} />
      <img src={iconBrick} />
    </label>
  </div></div>

}

function Grid(props) {
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
    if (row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1) {
      if (draggingMode === null) {
        setDraggingMode(1);
        return;
      }
    }
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

    const newColor = draggingMode ? Math.floor(1 + Math.random() * 3) : 0;
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
    className="noselect">
    <img
      draggable="false"
      src={"data:image/svg+xml ;charset=utf-8," + encodeURIComponent(exportToSVG(grid, props.topText, props.renderProps))} alt="SVG Preview"
      onPointerDown={(e) => onDown(...getCoord(e))}
      onPointerMove={(e) => onMove(...getCoord(e))}
      onPointerUp={onUp}
    /></div>;

}



function downloadSVG(svgContent, nameText) {
  // Create and trigger the download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze_"+ nameText +".svg";
  link.click();
}