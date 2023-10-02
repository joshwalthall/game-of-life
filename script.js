const aliveColor = '#FFFFFF';
const deadColor = '#000000';
const hoverColor = '#808080'

let gridCount = 64; // Number of x and y grid squares
let gridContainerSize = 800; // Will be converted to size in pixels
let gridTileSize = `${gridContainerSize / gridCount}px`;
console.log(`Grid Tile Size = ${gridTileSize}`);

const gridContainer = document.querySelector('#grid-container');

const CellFactory = (cellTile, xPos, yPos) => {
    const tile = cellTile;
    let isAlive = false;
    const xPosition = xPos;
    const yPosition = yPos;
    const position = [xPosition, yPosition];

    const _live = () => {
        isAlive = true;
    };
    const _die = () => {
        isAlive = false;
    };
    const _setTileColor = () => {
        if (isAlive) {
            tile.style.backgroundColor = aliveColor;
        } else if (!isAlive) {
            tile.style.backgroundColor = deadColor;
        };
    };

    const mouseEnter = () => {
        tile.style.backgroundColor = hoverColor;
    };
    const mouseLeave = () => {
        _setTileColor();
    };
    const getPosition = () => {
        return position;
    };
    const swapState = () => {
        if (isAlive === true) {
            _die();
            tile.dataset.isAlive = isAlive;
        } else if (isAlive === false)  {
            _live();
            tile.dataset.isAlive = isAlive;
        };
        _setTileColor();
    };

    return {isAlive, getPosition, mouseEnter, mouseLeave, swapState};
};

function createGameGrid() {
    // Set grid container rows and columns amounts and sizes
    gridContainer.style.gridTemplateRows = `repeat(${gridCount}, ${gridTileSize})`;
    gridContainer.style.gridTemplateColumns = `repeat(${gridCount}, ${gridTileSize})`;
    // Iterate through each row
    for (y = 1; y <= gridCount; y++) {
        for (x = 1; x <= gridCount; x++) {
            let cellTile = document.createElement('div');
            let newCell = CellFactory(cellTile, x,y);
            console.log('Created new cell');
            let cellPosition = newCell.getPosition();
            console.log(`New Cell Position: ${cellPosition}`);
            cellTile.style.gridArea = `${y} / ${x} / ${y+1} / ${x+1}`;
            cellTile.style.width = gridTileSize;
            cellTile.style.height = gridTileSize;
            cellTile.classList.add('cell-tile');
            cellTile.dataset.isAlive = 'false';
            cellTile.style.backgroundColor = deadColor;
            cellTile.dataset.isAlive = `${newCell.isAlive}`;
            cellTile.dataset.xPosition = `${cellPosition[0]}`;
            cellTile.dataset.yPosition = `${cellPosition[1]}`;
            cellTile.addEventListener('mouseenter', newCell.mouseEnter);
            cellTile.addEventListener('mouseleave', newCell.mouseLeave);
            cellTile.addEventListener('mousedown', newCell.swapState);
            gridContainer.appendChild(cellTile);
        };
    };
};

createGameGrid();