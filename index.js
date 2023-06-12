const fs = require('fs');
const filePath = './data.json';
const mineflayer = require("mineflayer");
const vec3 = require('vec3');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalFollow, GoalBreakBlock } = require('mineflayer-pathfinder').goals;

const bot = mineflayer.createBot({
  host: "localhost",
  port: 61774,
  username: "Rubin",
  version: "1.19.2"
});

bot.loadPlugin(pathfinder);
bot.once('spawn', async () => {
  console.log("Bin gespawnt");

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    await processJsonData(jsonData);

    console.log("Alle Werte verarbeitet.");
  } catch (err) {
    console.error('Fehler beim Lesen oder Verarbeiten der Datei:', err);
  }
});

async function processJsonData(jsonData) {
  for (const key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      const value = jsonData[key];
     
      await processValue(value);
    }
  }
}

async function processValue(value) {
  return new Promise((resolve) => {
    bot.pathfinder.setGoal(new goals.GoalNear(value.x, value.y, value.z, 1));
    bot.once("goal_reached", async () => {
      console.log("Angekommen");
      point = new vec3(value.x, value.y, value.z);
      bot.lookAt(point);
      const chest = await bot.openChest(bot.blockAt(point));
      for (const slot of chest.containerItems()) {
        if (slot) {
          const blacklist = value.blacklist;
          for (const key in blacklist) {
            try{
            if (blacklist.hasOwnProperty(key)) {
              const blacklistValue = blacklist[key];
              if (blacklistValue === slot.name) {
                await chest.withdraw(slot.type, null, slot.count);
                point = new vec3(176, 67,-174)
                await bot.lookAt(point)
                //bot.blockAt(point)
                await bot.toss(slot.type, 0, slot.counts)
              }
            }
        }catch{
            console.log("Die Kiste ist clean")
        }
          }
        }
      }
      await delay(1000);
      chest.close();
      resolve();
    });
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

bot.on("error", console.log);
bot.on("kicked", console.log);
