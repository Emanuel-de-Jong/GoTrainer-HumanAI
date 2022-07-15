const SERVER_URL = "http://localhost:8080/kata/";

function coordNumToName(x, y) {
    let xConvert = {
        1: "A",
        2: "B",
        3: "C",
        4: "D",
        5: "E",
        6: "F",
        7: "G",
        8: "H",
        9: "J",
        10: "K",
        11: "L",
        12: "M",
        13: "N",
        14: "O",
        15: "P",
        16: "Q",
        17: "R",
        18: "S",
        19: "T"
    };
    let yConvert = {
        1: 19,
        2: 18,
        3: 17,
        4: 16,
        5: 15,
        6: 14,
        7: 13,
        8: 12,
        9: 11,
        10: 10,
        11: 9,
        12: 8,
        13: 7,
        14: 6,
        15: 5,
        16: 4,
        17: 3,
        18: 2,
        19: 1
    };

    let coord = "" + xConvert[x] + yConvert[y];
    // console.log("coordNumToName " + x + ", " + y + " = " + coord);
    return coord;
}

function coordNameToNum(coord) {
    let xConvert = {
        "A": 1,
        "B": 2,
        "C": 3,
        "D": 4,
        "E": 5,
        "F": 6,
        "G": 7,
        "H": 8,
        "J": 9,
        "K": 10,
        "L": 11,
        "M": 12,
        "N": 13,
        "O": 14,
        "P": 15,
        "Q": 16,
        "R": 17,
        "S": 18,
        "T": 19
    };
    let yConvert = {
        19: 1,
        18: 2,
        17: 3,
        16: 4,
        15: 5,
        14: 6,
        13: 7,
        12: 8,
        11: 9,
        10: 10,
        9: 11,
        8: 12,
        7: 13,
        6: 14,
        5: 15,
        4: 16,
        3: 17,
        2: 18,
        1: 19,
    };

    let x = xConvert[coord[0]];
    let y = yConvert[parseInt(coord.substring(1))];
    // console.log("coordNameToNum " + coord + " = " + x + ", " + y);
    return { "x": x, "y": y };
}

function colorNumToName(num) {
    return num == 1 ? "W" : "B";
}

var server = {};

server.restart = async function() {
    console.log("restart");
    return fetch(SERVER_URL + "restart",
        { method: "GET" })
};

server.genmove = async function(color) {
    console.log("genmove");
    return fetch(SERVER_URL + "genmove?color=" + colorNumToName(color),
        { method: "GET" })
        .then(response => response.text())
        .then(data => {
            return coordNameToNum(data);
        });
};

server.analyze = async function(color) {
    console.log("analyze");
    return fetch(SERVER_URL + "analyze?color=" + colorNumToName(color),
        { method: "GET" })
        .then(response => response.text())
        .then(data => {
            let moves = []
            JSON.parse(data).forEach(element => {
                moves.push(coordNameToNum(element))
            });
            return moves;
        });
};

server.play = async function(x, y, color) {
    let coord = coordNumToName(x, y);
    console.log("play");
    return fetch(SERVER_URL + "play?color=" + colorNumToName(color) + "&coord=" + coord,
        { method: "GET" })
};