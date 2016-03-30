const CELL_EMPTY = false;
const CELL_LIFE  = true;

const ENABLE_DEBUG_RENDER = false;

const MAP_WIDTH = 400;
const MAP_HEIGHT = 400;
const CELL_SIZE = 4;

const CELL_X_COUNT = MAP_WIDTH / CELL_SIZE;
const CELL_Y_COUNT = MAP_HEIGHT / CELL_SIZE;

const UPDATE_RATE = 1000 / 25;

var GameState = {
    CurrentMap : [],
    PopulateMap: [],
    StaticMap: []
};

var updateInterval = null,
    $btnStartGame = $('.btn-start-game'),
    $btnNext = $('.btn-next-game'),
    $btnStopGame = $('.btn-stop-game'),
    $btnClearGame = $('.btn-clear-game'),
    $gameIteratorDiv = $('.game-turn-index'),
    $btnNoise = $('.btn-noise-game'),
    $gameField = $('#game-field'),
    canvas = $gameField[0],
    _ctx = canvas.getContext("2d");


canvas.width = MAP_WIDTH;
canvas.height = MAP_HEIGHT;

var maxIter = 0;

$gameField.css('width', MAP_WIDTH + 'px');
$gameField.css('height', MAP_HEIGHT + 'px');

clearGame();

function initMap( map, w, h )
{
    for(var x = 0; x < w; x++)
    {
        var gameXLine = [];

        for(var y = 0; y < h; y++)
        {
            gameXLine.push(CELL_EMPTY);
        }

        map.push(gameXLine);
    }
}

function getCellNeighboardCount( map, x, y, w, h )
{
    var nc = 0;

    for(var _x = x - 1; _x <= x + 1; _x++)
    {
        for(var _y = y - 1; _y <= y + 1; _y++)
        {
            if( _x != x || _y != y )
            {
                if ( _x >= 0 && _x < w && _y >= 0 && _y < h && map[_x][_y] === CELL_LIFE )
                {
                    nc++;
                }
            }
        }
    }

    return nc;
}

function hasCellCollisionStatic( staticMap, x, y, w, h)
{
    var collision = false;

    for(var _x = x - 1; _x <= x + 1; _x++)
    {
        for(var _y = y - 1; _y <= y + 1; _y++)
        {
            if( _x != x || _y != y )
            {
                if ( _x >= 0 && _x < w && _y >= 0 && _y < h && staticMap[_x][_y] === CELL_LIFE )
                {
                    collision = true;
                }
            }
        }
    }

    return collision;
}

function workCellState( gameState, x, y, mapCell, w, h )
{
    var _map = gameState.CurrentMap;
    var _hasCollisionStatic = hasCellCollisionStatic(gameState.StaticMap, x, y, w, h);

    if( !_hasCollisionStatic )
    {
        var _nc = getCellNeighboardCount(_map, x, y, w, h);

        switch(mapCell)
        {
            case CELL_EMPTY:
            {
                if( _nc == 3 )
                {
                    gameState.PopulateMap[x][y] = CELL_LIFE;
                }
                break;
            }
            case CELL_LIFE:
            {
                if( _nc >= 2 && _nc <= 3 )
                {
                    gameState.PopulateMap[x][y] = CELL_LIFE;
                }
                break;
            }
            default:
            {
                //NOP
                break;
            }
        }
    }
}

function updateGame( gameState, render, w, h )
{
    var _x = 0,
        _y = 0,
        _map = gameState.CurrentMap;

    gameState.PopulateMap = [];

    initMap( gameState.PopulateMap, w, h );

    _map.forEach(function(mapLine)
    {
        _y = 0;
        mapLine.forEach(function(mapCell)
        {
            workCellState(gameState, _x, _y, mapCell, w, h);
            _y++;
        });
        _x++;
    });

    gameState.CurrentMap = gameState.PopulateMap;

    if( render )
    {
        renderGameField( gameState, CELL_X_COUNT, CELL_Y_COUNT );
    }
}


function updateCellStat(map, w, h)
{
    if( ENABLE_DEBUG_RENDER )
    {
        /*
        for(var _x = 0 ; _x < w; _x++)
        {
            for(var _y = 0 ; _y < h; _y++)
            {
                if( map[_x][_y] == CELL_LIFE )
                {
                    var nc = getCellNeighboardCount(map, _x, _y, w, h);

                    var $cell = $('#game-field').find('div.game-field-cell[data-x_pos=' + _y + '][data-y_pos=' + _x + ']');

                    $cell.text( getCellNeighboardCount(map, _x, _y, w, h) );
                }
            }
        }
        */
    }
}


function fillCell(map, x, y, w, h, type)
{
    console.log('fillCell');

    switch (type)
    {
        case CELL_LIFE:
        {
            _ctx.fillStyle = "#00AA00";

           // updateCellStat(map, w, h);
            break;
        }
    }

    _ctx.fillRect(x * CELL_SIZE,y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
}

function renderGameField( gameState, w, h )
{
    console.log('renderGameField');

    var _x = 0,
        _y = 0;

    var map = gameState.CurrentMap,
        static_map = gameState.StaticMap;

    _ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);


    for (var x = 0; x < w; x++)
    {
        for (var y = 0; y < h; y++)
        {
            var mapCell = map[x][y];

            _ctx.fillStyle = "#000000";

            if( static_map[x][y] )
            {
                _ctx.fillStyle = "#0000AA";
            }
            else
            {
                if( mapCell === CELL_LIFE  )
                {
                    _ctx.fillStyle = "#00AA00";
                }
            }

            _ctx.fillRect(x * CELL_SIZE,y * CELL_SIZE,CELL_SIZE,CELL_SIZE);
        }
    }


    //updateCellStat(map, w, h);
}


function relMouseCoords(event)
{
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do{
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    }
    while(currentElement = currentElement.offsetParent);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x:canvasX, y:canvasY}
}
HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;

function initInput(map, w, h)
{
/*
    var hasMouseDown = false;

    $gameField.off('mousedown').on('mousedown', function(e)
    {
        hasMouseDown = true;
    });

    $gameField.off('mouseup').on('mouseup', function(e)
    {
        hasMouseDown = false;
    });

    $('#game-field').off('mouseout').on('mouseout', function(e)
    {
        hasMouseDown = false;
    });
*/
    $gameField.off('click').on('click', function(e)
    {
        var coords = canvas.relMouseCoords(e),
            canvasX = coords.x,
            canvasY = coords.y,
            x = Math.floor(canvasX / CELL_SIZE),
            y = Math.floor(canvasY / CELL_SIZE);

        e.preventDefault();

        console.log("click:", x, y);

        if( updateInterval == null && GameState.StaticMap[y][x] == CELL_EMPTY)
        {
            GameState.CurrentMap[y][x] = CELL_LIFE;

            fillCell(GameState.CurrentMap, x, y, w, h, CELL_LIFE);
        }
    });
}

function updateGameIter( value )
{
    $gameIteratorDiv.text(value);
}


function startGame()
{
    if( updateInterval == null )
    {
        $btnStartGame.attr('disabled', true);
        $btnNext.attr('disabled', true);
        $btnNoise.attr('disabled', true);
        $btnStopGame.removeAttr('disabled');

        updateInterval = setInterval(function()
        {
            gameNextTurn();
        }, UPDATE_RATE);
    }
}

function noiseFill(gameState, w, h)
{
    if( updateInterval == null )
    {
        noise.seed(Math.random() + Date.now());

        for (var x = 0; x < w; x++)
        {
            for (var y = 0; y < h; y++)
            {
                var value = noise.simplex2(x / 10, y / 10);

               // console.lo

                if( value > 0 )
                {
                    gameState.CurrentMap[x][y] = CELL_LIFE;
                }
                else
                {
                    gameState.CurrentMap[x][y] = CELL_EMPTY;
                }
            }
        }

        renderGameField( GameState, CELL_X_COUNT, CELL_Y_COUNT );
        initInput( GameState.CurrentMap, CELL_X_COUNT, CELL_Y_COUNT );
    }
}

function gameNextTurn()
{
    updateGame( GameState, true, CELL_X_COUNT, CELL_Y_COUNT );
    updateGameIter(maxIter);
    maxIter++;
}

function stopGame()
{
    if( updateInterval )
    {
        clearInterval( updateInterval );
        updateInterval = null;
        initInput( GameState.CurrentMap, CELL_X_COUNT, CELL_Y_COUNT );

        $btnStartGame.removeAttr('disabled');
        $btnNext.removeAttr('disabled');
        $btnNoise.removeAttr('disabled');
        $btnStopGame.attr('disabled', true);
    }
}

function clearGame()
{
    stopGame();

    maxIter = 0;

    GameState = {
        CurrentMap : [],
        PopulateMap: [],
        StaticMap: []
    };

    updateGameIter(maxIter);

    initMap( GameState.CurrentMap, CELL_X_COUNT, CELL_Y_COUNT );
    initMap( GameState.PopulateMap, CELL_X_COUNT, CELL_Y_COUNT );
    initMap( GameState.StaticMap, CELL_X_COUNT, CELL_Y_COUNT );

 //   GameState.StaticMap[10][10] = CELL_LIFE;
 //   GameState.StaticMap[20][20] = CELL_LIFE;
 //   GameState.StaticMap[20][10] = CELL_LIFE;
 //   GameState.StaticMap[10][20] = CELL_LIFE;

    renderGameField( GameState, CELL_X_COUNT, CELL_Y_COUNT );
    initInput( GameState.CurrentMap, CELL_X_COUNT, CELL_Y_COUNT );
}

$( document ).ready(function()
{
    $btnNext.off('click').on('click', function(e){
        e.preventDefault();

        if( updateInterval == null )
        {
            gameNextTurn();
        }
    });

    $btnStartGame.off('click').on('click', function(e)
    {
        e.preventDefault();
        startGame();
    });

    $btnStopGame.off('click').on('click', function(e)
    {
        e.preventDefault();
        stopGame();
    });

    $btnClearGame.off('click').on('click', function(e)
    {
        e.preventDefault();
        clearGame();
    });

    $btnNoise.off('click').on('click', function(e)
    {
        e.preventDefault();
        noiseFill(GameState, CELL_X_COUNT, CELL_Y_COUNT);
    });

});

