const fs = require("fs");

const RARITY = {
    2: "Common",
    3: "Rare",
    4: "Elite",
    5: "Super Rare/Priority",
    6: "Decisive"
};
const NATIONALITY = {
    0: "Universal", 1: "Eagle Union", 2: "Royal Navy",
    3: "Sakura Empire", 4: "Iron Blood", 5: "Dragon Empery",
    6: "Sardegna Empire", 7: "Northern Parliament", 8: "Iris Libre",
    9: "Vichya Dominion", 98: "Universal", 101: "Neptunia",
    104: "Kizuna AI", 105: "Hololive"
};

let TYPES = {};

let compiled = {};

function readFilesFromLanguage(lang = "EN") {
    let groups = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_group.json");
    let ships = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_template.json");
    let stats = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_statistics.json");
    let types = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_by_type.json")
    for (let id of Object.keys(groups)) {
        if (id === "all") continue;
        let group = groups[id];
        let ship = compiled[group.group_type];
        if (!ship) compiled[group.group_type] = ship = {
            id: group.group_type,
            code: group.code,

            name: {},
            property_hexagon: group.property_hexagon.join(''),

            type: group.type,
            armor: null,
            slots: null,
            nationality: group.nationality,
            data: {}
        };
        if (!TYPES[group.type]) TYPES[group.type] = {};
        if (!TYPES[group.type][lang.toLowerCase()]) TYPES[group.type][lang.toLowerCase()] = types[group.type].type_name.trim();
    }

    for (let id of Object.keys(ships)) {
        if (id === "all") continue;
        let ship = ships[id];
        let stat = stats[id];

        if (!ship || !stat) continue; // ship not here / not complete

        // compiled[ship.group_type].rarity.push(rarity[stat.rarity])
        if (ship.oil_at_start === 0) continue; // pseudo ship
        if (compiled[ship.group_type].nationality !== stat.nationality) continue; // pseudo ship
        compiled[ship.group_type].stars = ship.star_max;

        if (compiled[ship.group_type].name.code && compiled[ship.group_type].name.code !== ship.english_name) console.log("SHIP CODE NAME NOT MATCH ", id, ship.group_type, stat.name, lang)

        compiled[ship.group_type].name.code = ship.english_name;

        // https://github.com/minhducsun2002/boomer/blob/92c21b3624b539068ef3758d7f4c879fc8401952/src/db/al/models/ship_data_statistics.ts
        let [hp, fp, trp, aa, av, rld, _, acc, eva, spd, luk, asw] = stat.attrs;

        let specificShip = compiled[ship.group_type].data[ship.id];
        if (!specificShip) compiled[ship.group_type].data[ship.id] = specificShip = {
            id: ship.id,
            tags: stat.tag_list.length > 0 ? stat.tag_list : undefined, // save space
            type: ship.type,
            rarity: stat.rarity,
            stars: ship.star,
            oil: ship.oil_at_end,
            max_level: ship.max_level,
            stats: {hp, fp, trp, aa, av, rld, acc, eva, spd, luk, asw}
        };
        if (specificShip.type !== ship.type) console.log("SHIP TYPE NOT MATCH ", id, ship.group_type, stat.name, lang);

        // collapse, maybe the collapse algo can be collapsed later

        let slots = [1, 2, 3, 4, 5].map(i => ship["equip_" + i]);
        if (!compiled[ship.group_type].slots) compiled[ship.group_type].slots = slots;
        if (JSON.stringify(compiled[ship.group_type].slots) !== JSON.stringify(slots)) specificShip.slots = slots;

        let armor = stat.armor_type;
        if (!compiled[ship.group_type].armor) compiled[ship.group_type].armor = armor;
        if (compiled[ship.group_type].armor !== armor) specificShip.armor = armor;

        stat.name = stat.name.trim();
        if (!compiled[ship.group_type].name[lang.toLowerCase()]) compiled[ship.group_type].name[lang.toLowerCase()] = stat.name;
        if (compiled[ship.group_type].name[lang.toLowerCase()] !== stat.name) { // name not matching, probably retrofit
            if (!specificShip.name) specificShip.name = {};
            specificShip.name[lang.toLowerCase()] = stat.name;
        }
    }
}

function parseShips() {
    readFilesFromLanguage("EN");
    readFilesFromLanguage("CN");
    readFilesFromLanguage("JP");
    readFilesFromLanguage("KR");
    readFilesFromLanguage("TW");
    fs.writeFileSync("./dist/ships.json", JSON.stringify(compiled, null, '\t'));
    fs.writeFileSync("./dist/types.json", JSON.stringify(TYPES, null, '\t'));
}

module.exports = {parseShips};
