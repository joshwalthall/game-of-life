const neighborTranslations = [[-1,-1], [0,-1], [1,-1], [-1,0], [1,0], [-1,1], [0,1], [1,1]];

let gridCount = 32; // Number of x and y grid squares
let gridContainerSize = 800; // Will be converted to size in pixels
let gridTileSize = `${gridContainerSize / gridCount}px`;
let minSurvival = 2;
let maxSurvival = 3;
let minBirth = 3;
let maxBirth = 3;

const gridContainer = document.querySelector('#grid-container');
const tickButton = document.querySelector('#tick-button');

const GameFactory = () => {
    const states = ["paused", "running"];
    let state = states[0];
    let cells = [];

    const createGameGrid = () => {
        // Set grid container rows and columns amounts and sizes
        gridContainer.style.gridTemplateRows = `repeat(${gridCount}, ${gridTileSize})`;
        gridContainer.style.gridTemplateColumns = `repeat(${gridCount}, ${gridTileSize})`;
        // Iterate through each row
        for (y = 1; y <= gridCount; y++) {
            for (x = 1; x <= gridCount; x++) {
                let cellTile = document.createElement('div');
                let newCell = CellFactory(cellTile, x,y);
                cells.push(newCell);
                let cellPosition = newCell.getPosition();
                cellTile.style.gridArea = `${y} / ${x} / ${y+1} / ${x+1}`;
                cellTile.style.width = gridTileSize;
                cellTile.style.height = gridTileSize;
                cellTile.classList.add('cell-tile');
                cellTile.classList.add('dead');
                cellTile.dataset.positionX = `${cellPosition[0]}`;
                cellTile.dataset.positionY = `${cellPosition[1]}`;
                cellTile.addEventListener('mouseenter', newCell.mouseEnter);
                cellTile.addEventListener('mouseleave', newCell.mouseLeave);
                cellTile.addEventListener('mousedown', newCell.swapState);
                cellTile.addEventListener('mousedown', newCell.countLiveNeighbors);
                gridContainer.appendChild(cellTile);
            };
        };
    };
    const getNextCellState = (cell) => {
        cell.getNextAliveState();
    };
    const setNextCellState = (cell) => {
        cell.setNextAliveState();
    };
    const tick = () => {
        cells.forEach(getNextCellState);
        cells.forEach(setNextCellState);
    };

    return {cells, createGameGrid, tick};
};

const CellFactory = (cellTile, xPos, yPos) => {
    const tile = cellTile;
    const positionX = xPos;
    const positionY = yPos;
    const position = [positionX, positionY];
    let isAlive = false;
    let nextAliveState = false;

    const _live = () => {
        isAlive = true;
        tile.classList.remove('dead');
        tile.classList.add('alive');
    };
    const _die = () => {
        isAlive = false;
        tile.classList.remove('alive');
        tile.classList.add('dead');
    };
    const _countLiveNeighbors = () => {
        let liveNeighbors = 0;
        for (i = 0; i < 8; i++) {
            let neighborTranslate = neighborTranslations[i];
            let neighborPosX = (positionX + neighborTranslate[0]);
            if (neighborPosX === 0) {
                neighborPosX = gridCount;
            } else if (neighborPosX === (gridCount + 1)) {
                neighborPosX = 1;
            };
            let neighborPosY = (positionY + neighborTranslate[1]);
            if (neighborPosY === 0) {
                neighborPosY = gridCount;
            } else if (neighborPosY === (gridCount + 1)) {
                neighborPosY = 1;
            };
            let neighborTile = document.querySelectorAll(
                `[data-position-x='${neighborPosX}'][data-position-y='${neighborPosY}']`
            )[0];
            if (neighborTile.classList.contains("alive")) {
                liveNeighbors += 1;
            };
        };
        return liveNeighbors;
    };
    const getPosition = () => {
        return position;
    };
    const getAliveState = () => {
        return isAlive;
    };
    const getNextAliveState = () => {
        _countLiveNeighbors();
        let liveNeighbors = _countLiveNeighbors();
        if (isAlive === true && liveNeighbors >= minSurvival && liveNeighbors <= maxSurvival) {
            nextAliveState = true;
        } else if (isAlive === false && liveNeighbors >= minBirth && liveNeighbors <= maxBirth) {
            nextAliveState = true;
        } else {
            nextAliveState = false;
        };
    };
    const setNextAliveState = () => {
        if (isAlive === false && nextAliveState === true) {
            _live();
        } else if (isAlive === true && nextAliveState === false) {
            _die();
        };
    };
    const swapState = () => {
        if (isAlive === true) {
            _die();
        } else if (isAlive === false)  {
            _live();
        };
    };
    return {
        getPosition,
        getAliveState,
        getNextAliveState,
        setNextAliveState,
        swapState
    };
};

const game = GameFactory();
game.createGameGrid();
tickButton.addEventListener('click', game.tick);