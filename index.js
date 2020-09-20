/*
Entry point!
 */
const fs = require("fs");
const ships = require("./ships");

fs.writeFileSync("./dist/ships.json", JSON.stringify(ships.readFilesFromLanguage(), null, '\t'));