// Pop up a dialog to figure out if we're using Alpha Strike or shotgunBreath as I have dubbed it in code
let shotgunBreath = await Dialog.confirm({
    title: 'Prismatic Dragon Staff',
    content: `<p>Unleash the staff's true power?</p>`,
});

// I stole this function from the internet to capitalize the first letter of damage types. It looked better.
// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Define the options  in an array that we can roll. Each pair of {} is the options we're defining that belong together.
const breathOptions = [
    {"type": "cold", "throw": "dex", "saveDC": 15},
    {"type": "fire", "throw": "dex", "saveDC": 20},
    {"type": "acid", "throw": "dex", "saveDC": 15},
    {"type": "poison", "throw": "con", "saveDC": 15},
    {"type": "lightning", "throw": "dex", "saveDC": 15}
    ];

// User did not opt for shotgun; clone the original item and update the item's workflow with the right properties.
if (!shotgunBreath){
    // IMPROVEMENT: When rolling the dice to select an option, the message output can be done nicer. It can be merged into one message and be jazzed up.
    // thatlonelygbugbear#4393 showed an example here https://discord.com/channels/170995199584108546/1010273821401555087/1091736478985502731
    
    // Roll a dice for a number between 1 to 5.
    let breathRoll = await new Roll("1d5").evaluate({async: true});
    const msg = await breathRoll.toMessage();
    
    // Checks if Dice So Nice is installed to display an animation.
    await game.dice3d?.waitFor3DAnimationByMessageID(msg.id)
    
    // Behind the scenes, we are reducing the result by 1, because the breathOptions array above is 0-index, e.g. it starts counting from 0. A 5 element array is from 0 - 4.
    breathRoll = breathRoll.total - 1;
    
    // Define all the options we've rolled our way to for clarity.
    const breathDamage = breathOptions[breathRoll].type;
    const breathThrow = breathOptions[breathRoll].throw;
    const breathDC = breathOptions[breathRoll].saveDC;
    
    // We're cloning the original item into an "ephemeral" item, one we can roll without adding it to inventory.
    // While we do so, we change the related details from what we rolled earlier.
    const originalItem = await fromUuid(args[0].itemUuid);
    const clonedItem = originalItem.clone({
    "name": `Prismatic ${capitalizeFirstLetter(breathDamage)} Breath`,
    "flags.midi-qol.onUseMacroName": "",
    "flags.midi-qol.onUseMacroParts": [],
    "system.target.type": "cone", 
    "system.target.units": "ft", 
    "system.target.value": 30, 
    "system.damage.parts": [["4d6",`${breathDamage}`]],
    "system.save.ability": breathThrow,
    "system.save.dc": breathDC,
    "system.save.scaling": "flat",
    "system.uses": {max: "", per: "", recovery: "", value: null}
    });
    
    await MidiQOL.completeItemUse(clonedItem);   
}
else {
    
    // Defining an empty array to...
    let damageArray = [];
    
    // ... loop over all the options listed earlier and add them one by one to the array, so we can add them all together.
    for (let i of breathOptions){
        damageArray.push(["4d6",`${i.type}`]);
    }
    
    const originalItem = await fromUuid(args[0].itemUuid);
    const clonedItem = originalItem.clone({
    "name": "Alpha Strike",
    "flags.midi-qol.onUseMacroName": "",
    "flags.midi-qol.onUseMacroParts": [],
    "system.target.type": "cone", 
    "system.target.units": "ft", 
    "system.target.value": 30, 
    "system.damage.parts": damageArray,
    "system.save.ability": "dex",
    "system.save.dc": 20,
    "system.save.scaling": "flat",
    "system.uses": {max: "", per: "", recovery: "", value: null}
    });
    
    await MidiQOL.completeItemUse(clonedItem);
}