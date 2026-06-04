const rows = 20;
const cols = 20;

const gridElement = document.getElementById("grid");

let grid = [];

const startNode = { row: 0, col: 0 };
const endNode = { row: 19, col: 19 };

function createGrid() {

    gridElement.innerHTML = "";
    grid = [];

    for (let r = 0; r < rows; r++) {

        let currentRow = [];

        for (let c = 0; c < cols; c++) {

            const cell = document.createElement("div");

            cell.classList.add("cell");

            cell.dataset.row = r;
            cell.dataset.col = c;

            if (r === startNode.row && c === startNode.col) {
                cell.classList.add("start");
            }

            if (r === endNode.row && c === endNode.col) {
                cell.classList.add("end");
            }

            cell.addEventListener("click", () => {

                if (
                    !(r === startNode.row && c === startNode.col) &&
                    !(r === endNode.row && c === endNode.col)
                ) {
                    cell.classList.toggle("wall");
                }

            });

            gridElement.appendChild(cell);

            currentRow.push({
                row: r,
                col: c,
                isWall: false,
                parent: null,
                distance: Infinity,
                f: Infinity,
                g: Infinity
            });

        }

        grid.push(currentRow);
    }
}

function updateWalls() {

    document.querySelectorAll(".cell").forEach(cell => {

        const r = parseInt(cell.dataset.row);
        const c = parseInt(cell.dataset.col);

        grid[r][c].isWall =
            cell.classList.contains("wall");

    });
}

function getNeighbors(node) {

    const directions = [
        [-1,0],
        [1,0],
        [0,-1],
        [0,1]
    ];

    let neighbors = [];

    for(let d of directions){

        let nr = node.row + d[0];
        let nc = node.col + d[1];

        if(
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols
        ){
            neighbors.push(grid[nr][nc]);
        }
    }

    return neighbors;
}

function getCell(r,c){

    return document.querySelector(
        `[data-row='${r}'][data-col='${c}']`
    );
}

function sleep(ms){
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}

function clearPath(){

    document.querySelectorAll(".cell").forEach(cell => {

        cell.classList.remove("visited");
        cell.classList.remove("path");

    });

    for(let r=0;r<rows;r++){
        for(let c=0;c<cols;c++){

            grid[r][c].parent = null;
            grid[r][c].distance = Infinity;
            grid[r][c].f = Infinity;
            grid[r][c].g = Infinity;

        }
    }
}

function clearWalls(){

    document.querySelectorAll(".cell").forEach(cell => {

        cell.classList.remove("wall");

    });
}

function resetGrid(){

    createGrid();
}

async function drawPath(end){

    let current = end.parent;

    while(current){

        let cell = getCell(
            current.row,
            current.col
        );

        if(
            !cell.classList.contains("start")
        ){
            cell.classList.remove("visited");
            cell.classList.add("path");
        }

        current = current.parent;

        await sleep(40);
    }
}

async function runBFS(){

    clearPath();
    updateWalls();

    let queue = [];
    let visited = new Set();

    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    queue.push(start);

    visited.add(`${start.row}-${start.col}`);

    while(queue.length){

        let current = queue.shift();

        if(current === end){
            drawPath(end);
            return;
        }

        let neighbors = getNeighbors(current);

        for(let neighbor of neighbors){

            let key =
            `${neighbor.row}-${neighbor.col}`;

            if(
                !visited.has(key) &&
                !neighbor.isWall
            ){

                visited.add(key);

                neighbor.parent = current;

                queue.push(neighbor);

                let cell =
                getCell(
                    neighbor.row,
                    neighbor.col
                );

                if(
                    !cell.classList.contains("end")
                ){
                    cell.classList.add("visited");
                }

                await sleep(15);
            }
        }
    }

    alert("No Path Found");
}

async function runDFS(){

    clearPath();
    updateWalls();

    let stack = [];
    let visited = new Set();

    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    stack.push(start);

    while(stack.length){

        let current = stack.pop();

        let key =
        `${current.row}-${current.col}`;

        if(visited.has(key))
            continue;

        visited.add(key);

        if(current === end){
            drawPath(end);
            return;
        }

        let neighbors =
        getNeighbors(current);

        for(let neighbor of neighbors){

            let nkey =
            `${neighbor.row}-${neighbor.col}`;

            if(
                !visited.has(nkey) &&
                !neighbor.isWall
            ){

                neighbor.parent =
                current;

                stack.push(neighbor);

                let cell =
                getCell(
                    neighbor.row,
                    neighbor.col
                );

                if(
                    !cell.classList.contains("end")
                ){
                    cell.classList.add("visited");
                }

                await sleep(15);
            }
        }
    }

    alert("No Path Found");
}

async function runDijkstra(){

    clearPath();
    updateWalls();

    let start =
    grid[startNode.row][startNode.col];

    let end =
    grid[endNode.row][endNode.col];

    start.distance = 0;

    let unvisited = [];

    for(let row of grid){
        for(let node of row){
            unvisited.push(node);
        }
    }

    while(unvisited.length){

        unvisited.sort(
            (a,b)=>
            a.distance-b.distance
        );

        let current =
        unvisited.shift();

        if(current.isWall)
            continue;

        if(current.distance === Infinity)
            break;

        if(current === end){
            drawPath(end);
            return;
        }

        let neighbors =
        getNeighbors(current);

        for(let neighbor of neighbors){

            if(neighbor.isWall)
                continue;

            let dist =
            current.distance + 1;

            if(
                dist <
                neighbor.distance
            ){

                neighbor.distance =
                dist;

                neighbor.parent =
                current;

                let cell =
                getCell(
                    neighbor.row,
                    neighbor.col
                );

                if(
                    !cell.classList.contains("end")
                ){
                    cell.classList.add("visited");
                }
            }
        }

        await sleep(15);
    }

    alert("No Path Found");
}

function heuristic(a,b){

    return Math.abs(
        a.row-b.row
    ) +
    Math.abs(
        a.col-b.col
    );
}

async function runAStar(){

    clearPath();
    updateWalls();

    let start =
    grid[startNode.row][startNode.col];

    let end =
    grid[endNode.row][endNode.col];

    start.g = 0;
    start.f =
    heuristic(start,end);

    let open = [start];

    while(open.length){

        open.sort(
            (a,b)=>a.f-b.f
        );

        let current =
        open.shift();

        if(current === end){

            drawPath(end);
            return;
        }

        let neighbors =
        getNeighbors(current);

        for(let neighbor of neighbors){

            if(neighbor.isWall)
                continue;

            let tempG =
            current.g + 1;

            if(
                tempG <
                neighbor.g
            ){

                neighbor.parent =
                current;

                neighbor.g =
                tempG;

                neighbor.f =
                tempG +
                heuristic(
                    neighbor,
                    end
                );

                if(
                    !open.includes(
                        neighbor
                    )
                ){
                    open.push(
                        neighbor
                    );

                    let cell =
                    getCell(
                        neighbor.row,
                        neighbor.col
                    );

                    if(
                        !cell.classList.contains("end")
                    ){
                        cell.classList.add(
                            "visited"
                        );
                    }
                }
            }
        }

        await sleep(15);
    }

    alert("No Path Found");
}

document
.getElementById("visualizeBtn")
.addEventListener(
"click",
() => {

    const algo =
    document.getElementById(
        "algorithm"
    ).value;

    if(algo === "bfs")
        runBFS();

    else if(algo === "dfs")
        runDFS();

    else if(algo === "dijkstra")
        runDijkstra();

    else if(algo === "astar")
        runAStar();
});

document
.getElementById(
"clearPathBtn"
)
.addEventListener(
"click",
clearPath
);

document
.getElementById(
"clearWallsBtn"
)
.addEventListener(
"click",
clearWalls
);

document
.getElementById(
"resetBtn"
)
.addEventListener(
"click",
resetGrid
);

createGrid();