const aliveColor = '#FFFFFF';
const deadColor = '#000000';
// const hoverColor = '#808080'
const neighborTranslations = [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]];

let gridCount = 64; // Number of x and y grid squares
let gridContainerSize = 800; // Will be converted to size in pixels
let gridTileSize = `${gridContainerSize / gridCount}px`;
let minSurvival = 2;
let maxSurvival = 3;
let minBirth = 3;
let maxBirth = 3;

const gridContainer = document.querySelector('#grid-container');

const CellFactory = (cellTile, xPos, yPos) => {
    const tile = cellTile;
    const positionX = xPos;
    const positionY = yPos;
    const position = [positionX, positionY];
    let isAlive = false;
    let liveNeighborCount = 0;

    const _live = () => {
        isAlive = true;
    };
    const _die = () => {
        isAlive = false;
    };
    const _setTileColor = () => {
        if (isAlive) {
            tile.style.backgroundColor = aliveColor;
            // tile.classList.add('is-alive')
        } else if (!isAlive) {
            tile.style.backgroundColor = deadColor;
            // tile.classList.remove('is-alive')
        };
    };

    const getPosition = () => {
        return position;
    };
    const countLiveNeighbors = () => {
        liveNeighborCount = 0;
        for (i = 0; i < 8; i++) {
            let neighborTranslate = neighborTranslations[i];
            let neighborPosX = (positionX + neighborTranslate[0]);
            let neighborPosY = (positionY + neighborTranslate[1]);
            let neighborTile = document.querySelectorAll(
                `[data-position-x='${neighborPosX}'][data-position-y='${neighborPosY}']`
            )[0];
            if (neighborTile.dataset.isAlive === "true") {
                liveNeighborCount += 1;
            };
        };
        console.log(`Live Neighbors: ${liveNeighborCount}`);
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

    return {isAlive, getPosition, countLiveNeighbors, swapState};
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
            cellTile.dataset.positionX = `${cellPosition[0]}`;
            cellTile.dataset.positionY = `${cellPosition[1]}`;
            cellTile.addEventListener('mousedown', newCell.swapState);
            cellTile.addEventListener('mousedown', newCell.countLiveNeighbors);
            gridContainer.appendChild(cellTile);
        };
    };
};

createGameGrid();