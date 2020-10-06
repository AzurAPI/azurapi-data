const rarity = {
    2: "Common",
    3: "Rare",
    4: "Elite",
    5: "Super Rare/Priority",
    6: "Decisive"
};
const nationality = {
    0: "Universal", 1: "Eagle Union", 2: "Royal Navy",
    3: "Sakura Empire", 4: "Iron Blood", 5: "Dragon Empery",
    6: "Sardegna Empire", 7: "Northern Parliament", 8: "Iris Libre",
    9: "Vichya Dominion", 98: "Universal", 101: "Neptunia",
    104: "Kizuna AI", 105: "Hololive"
};

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

            name: null,
            tags: null,

            type: group.type,
            type_text: {},
            type_team: group.team_type,
            nationality: group.nationality,
            nationality_text: nationality[group.nationality],
            property_hexagon: group.property_hexagon,
            // rarity: [],
            data: {}
        };
        ship.type_text[lang.toLowerCase()] = types[group.type].type_name;
    }

    for (let id of Object.keys(ships)) {
        if (id === "all") continue;
        let ship = ships[id];
        let stat = stats[id];
        // compiled[ship.group_type].rarity.push(rarity[stat.rarity])
        if (ship.oil_at_start === 0) continue; // pseudo ship
        if (compiled[ship.group_type].nationality !== stat.nationality) continue; // pseudo ship
        compiled[ship.group_type].stars = ship.star_max;
        compiled[ship.group_type].name = ship.english_name;
        if (compiled[ship.group_type].tags && JSON.stringify(compiled[ship.group_type].tags) !== JSON.stringify(stat.tag_list)) console.log("DIED: " + ship.id);
        compiled[ship.group_type].tags = stat.tag_list;

        // https://github.com/minhducsun2002/boomer/blob/92c21b3624b539068ef3758d7f4c879fc8401952/src/db/al/models/ship_data_statistics.ts
        let [hp, fp, trp, aa, av, rld, _, acc, eva, spd, luk, asw] = stat.attrs;

        let specificShip = compiled[ship.group_type].data[ship.id];
        if (!specificShip) compiled[ship.group_type].data[ship.id] = specificShip = {
            id: ship.id,
            tags: stat.tag_list,
            type: {},
            names: {},
            rarity: stat.rarity,
            rarity_text: rarity[stat.rarity],
            stars: ship.star,
            oil: ship.oil_at_end,
            max_level: ship.max_level,
            stats: {
                hp, fp, trp, aa, av, rld, acc, eva, spd, luk, asw
            }
        };
        specificShip.type[lang.toLowerCase()] = types[ship.type].type_name;
        specificShip.names[lang.toLowerCase()] = stat.name;
    }
    return compiled;
}

module.exports = {readFilesFromLanguage, compiled};
