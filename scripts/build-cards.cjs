const fs = require("fs");

const inputFile = "cards.json";
const outputFile = "filtered-cards.json";

if (!fs.existsSync(inputFile)) {
  console.error(`Error: ${inputFile} not found`);
  process.exit(1);
}

console.log(`Reading ${inputFile}...`);
const data = JSON.parse(fs.readFileSync(inputFile, "utf8"));

console.log(`Transforming ${data.length} cards...`);

const transformed = data
  .map((card) => {
    const expansions = card.expansions;
    if (expansions.length === 0) {
      console.log(card);
      return;
    }

    const housesByExpansion = {};
    expansions.forEach((exp) => {
      housesByExpansion[exp.expansion] = exp.card.houses;
    });

    const allHouses = Object.values(housesByExpansion).flat();
    const uniqueHouses = [...new Set(allHouses)];

    const allSameSingleHouse =
      uniqueHouses.length === 1 &&
      expansions.every(
        (exp) =>
          exp.card.houses.length === 1 &&
          exp.card.houses[0] === uniqueHouses[0],
      );

    let firstHouses;
    try {
      firstHouses = expansions[0].card.houses;
    } catch (e) {
      console.log(card);
      throw e;
    }
    const allSameArray = expansions.every(
      (exp) => JSON.stringify(exp.card.houses) === JSON.stringify(firstHouses),
    );

    const isSkybeast = expansions.some(
      (exp) =>
        exp.expansion === "AEMBER_SKIES" && exp.cardNumber.startsWith("S"),
    );

    const isRebel = expansions.some(
      (exp) =>
        exp.expansion === "MARTIAN_CIVIL_WAR" &&
        exp.card.houses.includes("IronyxRebels"),
    );
    const isElder = expansions.some(
      (exp) =>
        exp.expansion === "MARTIAN_CIVIL_WAR" &&
        exp.card.houses.includes("Elders"),
    );

    let houseValue;
    if (allSameSingleHouse) {
      houseValue = uniqueHouses[0];
    } else if (allSameArray) {
      houseValue = firstHouses;
    } else {
      houseValue = housesByExpansion;
    }

    if (isSkybeast) {
      houseValue = "Skybeast";
    }
    if (isElder) {
      houseValue = {
        ...Object.fromEntries(expansions.map((e) => [e.expansion, "Mars"])),
        MARTIAN_CIVIL_WAR: "Elders",
      };
    }
    if (isRebel) {
      houseValue = {
        ...Object.fromEntries(expansions.map((e) => [e.expansion, "Mars"])),
        MARTIAN_CIVIL_WAR: "IronyxRebels",
      };
    }

    let slug = card.cardTitleUrl.split("/").at(-1);
    slug = slug.substring(0, slug.length - 4);

    const done = {
      title: card.cardTitle,
      slug,
      type: card.cardType,
      amber: card.amber,
      power: card.power,
      armor: card.armor,
      house: houseValue,
      expansions: card.expansions.map((e) => e.expansion),
    };
    return done;
  })
  .filter((c) => !!c);

fs.writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
console.log(`Done! Written to ${outputFile}`);
