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
let gridContainerSize = 600; // Will be converted to size in pixels
let gridTileSize = `${gridContainerSize / gridCount}px`; // Size of each cell in pixels
let lifeChance = 0.20; // Odds of randomly generated cell being alive
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
const regenDialog = document.querySelector('#regen-dialog');
const regenForm = document.querySelector('#regen-form');
const lifeChanceSlider = document.querySelector('#life-chance');
const lifeChanceDisplay = document.querySelector('#life-chance-display');
const minSurvivalSlider = document.querySelector('#min-survival');
const minSurvivalDisplay = document.querySelector('#min-survival-display');
const maxSurvivalSlider = document.querySelector('#max-survival');
const maxSurvivalDisplay = document.querySelector('#max-survival-display');
const minBirthSlider = document.querySelector('#min-birth');
const minBirthDisplay = document.querySelector('#min-birth-display');
const maxBirthSlider = document.querySelector('#max-birth');
const maxBirthDisplay = document.querySelector('#max-birth-display');
const confirmRegenButton = document.querySelector('#confirm-regen-button');
const defaultRegenButton = document.querySelector('#restore-regen-defaults');
const cancelRegenButton = document.querySelector('#cancel-regen-button');
const regenInputs = [
    lifeChanceSlider,
    minSurvivalSlider,
    maxSurvivalSlider,
    minBirthSlider,
    maxBirthSlider,
];
const regenDisplays = [
    lifeChanceDisplay,
    minSurvivalDisplay,
    maxSurvivalDisplay,
    minBirthDisplay,
    maxBirthDisplay,
];
const defaultRegenValues = [
    20, // Percent of cells that start out alive
    2, // Minimum number of neighbors for survival
    3, // Maximum number of neighbors for survival
    3, // Minimum number of neighbors for birth
    3, // Maximum number of neighbors for birth
];
let savedInputValues = defaultRegenValues;

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
    const _updateInputDisplay = (input, display) => {
        let displayText = '';
        displayText = `${input.value}`;
        if (display.classList.contains('percentage')) {
            displayText += '%';
        };
        display.textContent = displayText;
    };
    const _saveInputValues = () => {
        savedInputValues = [];
        for (let i = 0; i < regenInputs.length; i++) {
            savedInputValues.push(regenInputs[i].value);
        };
    };
    const _resetInputValuesToSaved = () => {
        for (let i = 0; i < regenInputs.length; i++) {
            let input = regenInputs[i];
            let display = regenDisplays[i];
            input.value = savedInputValues[i];
            _updateInputDisplay(input, display);
        };
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
    const showRegenDialog = () => {
        if (timer !== 0) {
            _stop();
        };
        _resetInputValuesToSaved();
        regenDialog.showModal();
    };
    const regenerate = (submitEvent) => {
        submitEvent.preventDefault();
        lifeChance = (Number(document.getElementById('life-chance').value) / 100);
        minSurvival = Number(document.getElementById('min-survival').value);
        maxSurvival = Number(document.getElementById('max-survival').value);
        minBirth = Number(document.getElementById('min-birth').value);
        maxBirth = Number(document.getElementById('max-birth').value);
        _populateGameGrid();
        generationNumber = 0;
        generationCounter.textContent = generationNumber;
        _saveInputValues();
        regenDialog.close();
    };
    const addDisplayUpdaters = (input, index) => {
        input.addEventListener('input', () => {
            let display = regenDisplays[index];
            _updateInputDisplay(input, display);
        });
    };
    const setMinMaxLimiters = (minInput, minDisplay, maxInput, maxDisplay) => {
        minInput.addEventListener('input', () => {
            if (minInput.value > maxInput.value) {
                minInput.value = maxInput.value;
                _updateInputDisplay(minInput, minDisplay);
            };
        });
        maxInput.addEventListener('input', () => {
            if (maxInput.value < minInput.value) {
                maxInput.value = minInput.value;
                _updateInputDisplay(maxInput, maxDisplay);
            };
        });
    };
    const resetInputValuesToDefault = () => {
        for (let i = 0; i < regenInputs.length; i++) {
            let input = regenInputs[i];
            let display = regenDisplays[i];
            input.value = defaultRegenValues[i];
            _updateInputDisplay(input, display);
        };
        _saveInputValues();
        showRegenDialog();
    };
    const cancelRegen = () => {
        _resetInputValuesToSaved();
        regenDialog.close();
    };

    return {
        gridRows,
        setupInitialGrid,
        startStop,
        changeTickRate,
        showRegenDialog,
        regenerate,
        addDisplayUpdaters,
        setMinMaxLimiters,
        resetInputValuesToDefault,
        cancelRegen,
    };
};

const game = GameFactory();
game.setupInitialGrid();
tickRateSlider.addEventListener('input', game.changeTickRate);
startStopButton.addEventListener('click', game.startStop);
regenerateButton.addEventListener('click', game.showRegenDialog);
regenInputs.forEach(game.addDisplayUpdaters);
game.setMinMaxLimiters(minSurvivalSlider, minSurvivalDisplay, maxSurvivalSlider, maxSurvivalDisplay);
game.setMinMaxLimiters(minBirthSlider, minBirthDisplay, maxBirthSlider, maxBirthDisplay);
confirmRegenButton.addEventListener('click', game.regenerate);
defaultRegenButton.addEventListener('click', game.resetInputValuesToDefault);
cancelRegenButton.addEventListener('click', game.cancelRegen);
