const rarity = {
    "2": "Common",
    "3": "Rare",
    "4": "Elite",
    "5": "Super Rare/Priority",
    "6": "Decisive"
}

function readFilesFromLanguage(lang = "EN") {
    let compiled = {};
    let groups = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_group.json");
    let ships = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_template.json");
    let stats = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_statistics.json");
    let types = require("../AzurLaneSourceJSON/" + lang + "/sharecfg/ship_data_by_type.json")

    for (let id of Object.keys(groups)) {
        if (id === "all") continue;
        let group = groups[id];
        compiled[group.group_type] = {
            id: group.group_type,
            code: group.code,
            type: types[group.type].type_name,
            nationality: group.nationality,
            property_hexagon: group.property_hexagon,
            // rarity: [],
            data: []
        };
    }

    for (let id of Object.keys(ships)) {
        if (id === "all") continue;
        let ship = ships[id];
        let stat = stats[id];
        // compiled[ship.group_type].rarity.push(rarity[stat.rarity])
        compiled[ship.group_type].data.push({
            id: ship.id,
            tags: stat.tag_list,
            type: types[ship.type].type_name,
            energy: ship.energy,
            names: {
                code: stat.english_name,
                name: stat.name
            },
            rarity: stat.rarity,
            rarity_text: rarity[stat.rarity],
            nationality: stat.nationality,
            stars: {
                current: ship.star,
                max: ship.star_max
            },
            oil: {
                base: ship.oil_at_start,
                max: ship.oil_at_end
            },
            level: {
                max: ship.max_level
            }
        });
    }
    for (let id of Object.keys(compiled)) {
        let ship = compiled[id];
        ship.data.sort((a, b) => a.rarity - b.rarity);
    }
    return compiled;
}

module.exports = {readFilesFromLanguage};