/*
Entry point!
 */
const fs = require("fs");
const ships = require("./ships");

ships.readFilesFromLanguage("EN");
ships.readFilesFromLanguage("CN");
ships.readFilesFromLanguage("JP");
ships.readFilesFromLanguage("KR");
ships.readFilesFromLanguage("TW");
fs.writeFileSync("./dist/ships.json", JSON.stringify(ships.compiled, null, '\t'));