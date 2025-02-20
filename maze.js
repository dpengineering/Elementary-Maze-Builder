function createMaze() {
  const size = 16;
  let grid = Array(size).fill().map(() => Array(size).fill(false));
  let initials = ['', ''];

  function toggleCell(row, col) {
    if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
      return; // Prevent border cell toggling
    }
    grid[row][col] = !grid[row][col];
    renderMaze();
  }

  function handleInitialChange(index, value) {
    initials[index] = value.toUpperCase().slice(0, 1);
    renderMaze();
  }

  function renderMaze() {
    const container = document.getElementById('maze-container');
    container.innerHTML = '';

    for (let row = 0; row < size; row++) {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'maze-row';

      for (let col = 0; col < size; col++) {
        const cell = document.createElement('div');
        cell.className = `maze-cell ${grid[row][col] ? 'active' : ''}`;

        if (row === 0 || row === size - 1 || col === 0 || col === size - 1) {
          cell.classList.add('border');
        }

        if (row === 0 && (col === 7 || col === 8)) {
          const input = document.createElement('input');
          input.type = 'text';
          input.maxLength = 1;
          input.value = initials[col - 7] || '';
          input.className = 'maze-initial-input';
          input.oninput = (e) => handleInitialChange(col - 7, e.target.value);
          cell.appendChild(input);
        }

        cell.onclick = () => toggleCell(row, col);
        rowDiv.appendChild(cell);
      }
      container.appendChild(rowDiv);
    }
  }

function exportToSVG() {
  const cellSize = 30;
  const svgWidth = size * cellSize;
  const svgHeight = size * cellSize;
  const borderRadius = 10;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">`;

  // Define a mask to "cut out" the inner open area of the maze
  svgContent += `
    <defs>
      <mask id="mazeMask">
        <rect width="${svgWidth}" height="${svgHeight}" fill="white"/> <!-- Full mask background -->
        <rect x="${cellSize}" y="${cellSize}" width="${svgWidth - 2 * cellSize}" height="${svgHeight - 2 * cellSize}" fill="black"/> <!-- Cut out the inside -->
      </mask>
    </defs>`;

  // Draw the outer border using the mask (so only the walls remain)
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
    " fill="black" mask="url(#mazeMask)"/>`;

  // Draw maze walls inside the grid
  for (let row = 1; row < size - 1; row++) {
    for (let col = 1; col < size - 1; col++) {
      if (grid[row][col]) {
        svgContent += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="black"/>`;
      }
    }
  }

  // Add white circles inside the four corner cells
  const circleRadius = 7; // Adjust size if needed
  const circleOffset = cellSize / 2;
  svgContent += `
    <circle cx="${circleOffset}" cy="${circleOffset}" r="${circleRadius}" fill="white"/> <!-- Top-left -->
    <circle cx="${svgWidth - circleOffset}" cy="${circleOffset}" r="${circleRadius}" fill="white"/> <!-- Top-right -->
    <circle cx="${circleOffset}" cy="${svgHeight - circleOffset}" r="${circleRadius}" fill="white"/> <!-- Bottom-left -->
    <circle cx="${svgWidth - circleOffset}" cy="${svgHeight - circleOffset}" r="${circleRadius}" fill="white"/> <!-- Bottom-right -->
  `;

  svgContent += `</svg>`;

  // Create and trigger the download
  const blob = new Blob([svgContent], { type: "image/svg+xml" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "maze.svg";
  link.click();
}





function exportToPNG() {
  const cellSize = 30;
  const canvasSize = size * cellSize;
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw filled cells (including border cells)
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] || row === 0 || row === size - 1 || col === 0 || col === size - 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }

  // Draw border outline
  ctx.strokeStyle = "black";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  // Download the PNG
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "maze.png";
  link.click();
}


  document.addEventListener('DOMContentLoaded', () => {
    renderMaze();
    document.getElementById('export-svg').addEventListener('click', exportToSVG);
  });
  
  document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('export-png').addEventListener('click', exportToPNG);
});
}

createMaze();
