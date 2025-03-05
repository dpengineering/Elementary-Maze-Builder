import { useEffect, useState, useRef} from "react";
import './App.css';

import iconOutline from './assets/outline.svg';
import iconBrick from './assets/bricks.svg';
import iconFilled from './assets/fill.svg';

import { exportToSVG } from './rendering';
import {Grid} from './Grid'
import * as D from './Dimensions';

export const MODE_OUTLINE = 0, MODE_FILLED = 1, MODE_BRICKS = 2;

export default function App() {
  // Create the grid state: Border squares (1,2,3) and empty interior squares (0)
  const [grid, setGrid] = useState(decodeMaze(window.location.hash));

  const [engravings, setEngravings] = useState(
    [
      {
        text: '<Your Name Here>',
        row: 0,
        col: 1,
        rotation: 0,
      },
      {
        text: '',
        row: 1,
        col: D.CELLS_PER_COL - 1,
        rotation: 90,
      },
      {
        text: '',
        row: D.CELLS_PER_COL - 1,
        col: 1,
        rotation: 180,
      },
      {
        text: '',
        row: 1,
        col: 0,
        rotation: 270,
      },
    ]
  );
  const [selectedEngraving, setSelectedEngraving] = useState(null);

  const [mode, setMode] = useState(MODE_BRICKS);
  const [showIssues, setShowIssues] = useState(false);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [basePlateColorIndex, setBasePlateColorIndex] = useState(0);

  const intervalRef = useRef(0);
  const inputRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    window.location.hash = encodeMaze(grid);
  }, [grid]);

  useEffect(() => {
    if (selectedEngraving == null || inputRef.current == null) return;
    inputRef.current.focus();
    // steal focus after click has been handled
    setTimeout(()=>{
      inputRef.current.focus();
    }, 0)
  }, [selectedEngraving]);

  if (selectedEngraving != null && inputRef.current != null) {
    inputRef.current.focus();
    // steal focus after click has been handled
    setTimeout(()=>{
      inputRef.current.focus();
    }, 0)
  }

  // Function to handle text input changes
  const handleTextChange = (event) => {
    let value = event.target.value.toUpperCase(); // Convert input to uppercase for consistency
    const selectedEngravingObj = engravings[selectedEngraving];
    if (!selectedEngravingObj) return;
    setEngravings(engravings.map((engraving, index) => {
      if (index === selectedEngraving) {
        return {
          ...engraving, text: value.slice(0,28),// Limit input length to 45 characters to fit within the box without overflow
        };
      }
      return engraving;
    }));
          
  };

  const renderProps = {
    showIssues: showIssues,
    mode: mode,
    zoom: zoomPercent / 100,
    selectedEngraving: selectedEngraving,
    basePlateColor: D.BASEPLATE_COLORS[basePlateColorIndex]
  };

  const onExport = () => {
    const svg = exportToSVG(grid, engravings, { mode: MODE_OUTLINE, validateDesign: true});
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
      downloadSVG(svg, engravings[0].text);
    }
  };

  let engravingDiv = null;
  if (mode !== MODE_BRICKS && selectedEngraving != null) {
    engravingDiv = <div>
      <div style={{ display: "flex", justifyContent: "space-between", margin: `20px auto` }}>
        <input
          type="text"
          value={engravings[selectedEngraving].text}
          onChange={handleTextChange}
          ref={inputRef}
        />
      </div>
    </div>;
  }

  let baseplateColorPickerDiv = null;
  if (mode === MODE_BRICKS) {
    baseplateColorPickerDiv = <div>
      <div id="baseplateColorPicker">
        {D.BASEPLATE_COLORS.map((color, index) => {
          return <button
            key={index}
            style={{backgroundColor: color[0]}}
            onClick={() => setBasePlateColorIndex(index)}
          />
        })}
      </div>
    </div>;
  }


  return <div
    style={{minHeight: "100vh"}}
    onPointerDown={(e) => {
      if (e.target == gridRef.current || e.target == inputRef.current) return;
      if (selectedEngraving != null) {
        setSelectedEngraving(null);
      }
    }}>
    <div style={{ display: "flex", justifyContent: "space-between"}}>
      <button id="exportButton" onClick={onExport}>Export</button>
      <ModeSelector mode={mode} onChange={(event) => {
        setMode(parseInt(event.target.value));
        clearInterval(intervalRef.current);
        setShowIssues(false);
      }} />
      {engravingDiv}
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
      flexDirection: "row",
      alignItems: "center",
      position: "relative",
      justifyContent: "space-between",
    }}>
      <Grid
        grid={grid}
        setGrid={setGrid}
        engravings={engravings}
        renderProps={renderProps}
        setSelectedEngraving={setSelectedEngraving}
        gridRef={gridRef}
      />
      {baseplateColorPickerDiv}
    </div>
    
  </div>
}

function ModeSelector(props) {
  return <div className="mode-container">
    <div className="mode">
      <label htmlFor="brickIcon">
        <input type="radio" name="mode" className="brickIcon" id="brickIcon" value={MODE_BRICKS} checked={props.mode == MODE_BRICKS} onChange={props.onChange} />
        <img src={iconBrick} />
      </label>
      <label htmlFor="filledIcon">
        <input type="radio" name="mode" className="filledIcon" id="filledIcon" value={MODE_FILLED} checked={props.mode == MODE_FILLED} onChange={props.onChange} />
        <img src={iconFilled} />
      </label>
      <label htmlFor="outlineIcon">
        <input type="radio" name="mode" className="outlineIcon" id="outlineIcon" value={MODE_OUTLINE} checked={props.mode == MODE_OUTLINE} onChange={props.onChange} />
        <img src={iconOutline} />
      </label>
    </div>
  </div>
}

function downloadSVG(svgContent, nameText) {
  // Create and trigger the download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze_"+ nameText +".svg";
  link.click();
}

function emptyMaze() {
  return Array(D.CELLS_PER_COL).fill().map((_, rowIndex) =>
    Array(D.CELLS_PER_COL).fill().map((_, colIndex) =>
      rowIndex === 0 || rowIndex === D.CELLS_PER_COL - 1 || colIndex === 0 || colIndex === D.CELLS_PER_COL - 1 ? 1 : 0
    )
  )
}

function decodeMaze(hash) {
  hash = hash.slice(1); // remove the leading '#'
  if (!hash) {
    return emptyMaze();
  }
  let binaryString = '';
  
  for (let i = 0; i < hash.length; i++) {
    if (!'0123456789abcdef'.includes(hash[i])) {
      return emptyMaze();
    }
    binaryString += parseInt(hash[i], 16).toString(2).padStart(4, '0');
  }
  const LENGTH = D.CELLS_PER_COL - 2;

  if (binaryString.length !== LENGTH * LENGTH) {
    return emptyMaze();
  }

  const maze = emptyMaze();
  for (let i = 0; i < binaryString.length; i++) {
    maze[Math.floor(i / LENGTH) + 1][i % LENGTH + 1] = parseInt(binaryString[i]);
  }
  return maze;
}

function encodeMaze(grid) {
  let number = '';
  let hasWalls = false;
  for (let row = 1; row < D.CELLS_PER_COL - 1; row++) {
    for (let col = 1; col < D.CELLS_PER_COL - 1; col++) {
      number += grid[row][col];
      if (grid[row][col]) {
        hasWalls = true;
      }
    }
  }
  if (!hasWalls) {
    return '';
  }
  if (number.length % 4 !== 0) {
    number = number.padEnd(number.length + (4 - number.length % 4), '0');
  }
  let hexResult = '';
  for (let i = 0; i < number.length; i += 4) {
    const hex = parseInt(number.slice(i, i + 4), 2).toString(16);
    hexResult += hex;
  }
  return hexResult;
}