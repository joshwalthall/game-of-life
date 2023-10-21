const neighborTranslations = [
    [-1,-1],
    [0,-1],
    [1,-1],
    [-1,0],
    [1,0],
    [-1,1],
    [0,1],
    [1,1],
];

let gridCount = 128; // Number of x and y grid squares
let gridContainerSize = 700; // Will be converted to size in pixels
let gridTileSize = `${gridContainerSize / gridCount}px`; // Size of each cell in pixels
let lifeChance = 0.3; // Odds of randomly generated cell being alive
let minSurvival = 2; // Minimum alive neighbors for cell to stay alive
let maxSurvival = 3; // Maximum alive neighbors for cell to stay alive
let minBirth = 3; // Minimum alive neighbors for dead cell to come to life
let maxBirth = 3; // Maximum alive neighbors for dead cell to come to life
const tickRateBase = 600 // Base from which tickRate will be subtracted
let tickRateReductor = 250 // Amount to reduce tickRateBase by to get tickRate
let tickRate = (tickRateBase - tickRateReductor); // Time in ms between each tick
let generationNumber = 0; // Increments with each tick

const generationCounter = document.querySelector('#generation-counter');
const gridContainer = document.querySelector('#grid-container');
const startStopButton = document.querySelector('#start-stop-button');
const regenerateButton = document.querySelector('#regenerate-button');
const tickRateSlider = document.querySelector('#tick-rate');

const GameFactory = () => {
    let gridRows = [];
    let timer = 0;

    const _setGridCellCount = () => {
        gridContainer.style.gridTemplateRows = `repeat(${gridCount}, ${gridTileSize})`;
        gridContainer.style.gridTemplateColumns = `repeat(${gridCount}, ${gridTileSize})`;
    };
    const _createGameGrid = () => {
        for (y = 1; y <= gridCount; y++) {
            let gridRow = [];
            for (x = 1; x <= gridCount; x++) {
                let cellTile = document.createElement('div');
                let gridValue = [cellTile];
                cellTile.style.gridArea = `${y} / ${x} / ${y+1} / ${x+1}`;
                cellTile.style.width = gridTileSize;
                cellTile.style.height = gridTileSize;
                cellTile.classList.add('cell-tile');
                gridContainer.appendChild(cellTile);
                gridRow.push(gridValue);
            };
            gridRows.push(gridRow);
        };
    };
    const _populateGameGrid = () => {
        for (y = 0; y < gridCount; y++) {
            let gridRow = gridRows[y]; // Get row by grid y index
            for (x = 0; x < gridCount; x++) {
                let cell = gridRow[x]; // Get cell by row x index
                let cellTile = cell[0];
                let randomNumber = Math.random();
                if (randomNumber > lifeChance) {
                    cell[1] = 0;
                    cellTile.classList.remove('alive');
                    cellTile.classList.add('dead');
                } else if (randomNumber <= lifeChance) {
                    cell[1] = 1;
                    cellTile.classList.remove('dead');
                    cellTile.classList.add('alive');
                };
            };
        };
    };
    const _countLiveNeighbors = (rowPos, colPos) => {
        let liveNeighbors = 0;
        for (t = 0; t < neighborTranslations.length; t++) {
            translation = neighborTranslations[t]; // Get translation value by index
            transRowPos = (rowPos + translation[0]); // Get translated row position
            if (transRowPos === gridCount) {transRowPos = 0;}; // Y axis wraparound
            transColPos = (colPos + translation[1]); // Get translated column position
            if (transColPos === gridCount) {transColPos = 0;}; // X axis wraparound
            neighborCell = gridRows.at(transRowPos).at(transColPos);
            aliveState = neighborCell[1];
            liveNeighbors += aliveState;
        };
        return liveNeighbors;
    };
    const _getNextCellState = (currState, liveNeighbors) => {
        let nextState = 0;
        if (currState === 1 && liveNeighbors >= minSurvival && liveNeighbors <= maxSurvival) {
            nextState = 1;
        } else if (currState === 0 && liveNeighbors >= minBirth && liveNeighbors <= maxBirth) {
            nextState = 1;
        };
        return nextState;
    };
    const _tick = () => {
        let nextStateRows = [];
        for (y = 0; y < gridCount; y++) {
            let gridRow = gridRows[y]; // Get row by grid y index
            let nextStateRow = [];
            for (x = 0; x < gridCount; x++) {
                let cell = gridRow[x]; // Get cell by row x index
                let currState = cell[1];
                let liveNeighbors = _countLiveNeighbors(y, x);
                let nextCellState = _getNextCellState(currState, liveNeighbors);
                nextStateRow.push(nextCellState);
            };
            nextStateRows.push(nextStateRow);
        };
        for (y = 0; y < gridCount; y++) {
            for (x = 0; x < gridCount; x++) {
                let gridRow = gridRows.at(y);
                let cellArray = gridRow.at(x);
                let cell = cellArray[0];
                let currCellState = cellArray[1];
                let nextCellState = nextStateRows[y][x];
                if (currCellState === 1 && nextCellState === 0) {
                    cell.classList.remove('alive');
                    cell.classList.add('dead');
                    cellArray[1] = nextCellState;
                } else if (currCellState === 0 && nextCellState === 1) {
                    cell.classList.remove('dead');
                    cell.classList.add('alive');
                    cellArray[1] = nextCellState;
                };
            };
        };
        generationNumber++;
        generationCounter.textContent = generationNumber.toLocaleString();
    };
    const _play = () => {
        if (timer === 0) {
            timer = setInterval(_tick, tickRate);
        };
        startStopButton.textContent = 'Stop';
    };
    const _stop = () => {
        if (timer !== 0) {
        clearInterval(timer);
        timer = 0;
        };
        startStopButton.textContent = 'Start';
    };
    const setupInitialGrid = () => {
        _setGridCellCount();
        _createGameGrid();
        _populateGameGrid();
    };
    const startStop = () => {
        if (timer === 0) {
            _play();
        } else if (timer !== 0) {
            _stop();
        }
    };
    const changeTickRate = () => {
        tickRateReductor = tickRateSlider.value;
        tickRate = (tickRateBase - tickRateReductor);
        if (timer !== 0) {
            _stop();
            _play();
        };
    };
    const regenerate = () => {
        if (timer !== 0) {
            _stop();
        };
        _populateGameGrid();
        generationNumber = 0;
        generationCounter.textContent = generationNumber;
    };

    return {gridRows, setupInitialGrid, startStop, changeTickRate, regenerate};
};

const game = GameFactory();
game.setupInitialGrid();
startStopButton.addEventListener('click', game.startStop);
regenerateButton.addEventListener('click', game.regenerate);
tickRateSlider.addEventListener('input', game.changeTickRate);