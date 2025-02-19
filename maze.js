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
    initials[index] = value.toUpperCase().slice(0, 1); // Limit to one uppercase letter
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

  document.addEventListener('DOMContentLoaded', renderMaze);
}
createMaze();
