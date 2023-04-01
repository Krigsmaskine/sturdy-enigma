if (!character){
  ui.notifications.warn("No character assigned.")
  return
};

let dialogContent = "";

dialogContent += `<b>Hit Points:</b> ${character.system.attributes.hp.value}/${character.system.attributes.hp.max}.<br><b>Temporary:</b> ${Number(character.system.attributes.hp.temp)}.`

// We check if they have an Arcane Ward resource.
const wardKey = Object.keys(character.system.resources).find(k => character.system.resources[k].label === "Arcane Ward");

let arcaneWardvalue;

if (wardKey){
  arcaneWardValue = character.system.resources?.[wardKey].value;
  dialogContent += `<br><b>Arcane Ward:</b> ${arcaneWardValue}.`
};

dialogContent += `<form>
<div class="form-group">
<div class="form-fields"><input name="damagetaken" type="number" autofocus></div>
</div>
</form>`

new Dialog({
title: "Hurt or Heal",
content: dialogContent,
buttons: {
  damage: {
    label: `Damage <i class="fa-solid fa-coffin-cross"></i>`,
    callback: async (html) => {        
      const value1 = html[0].querySelector('input[name=damagetaken]').value;
      if (!value1){return}              
      if (!wardKey){await character.applyDamage(value1);}
      else {await arcaneWardDamage(value1, character, arcaneWardValue);}
    }
  },
  heal: {
      label: `Heal <i class="fa-regular fa-hand-holding-medical"></i>`,
      callback: (html) => {
        const value1 = html[0].querySelector('input[name=damagetaken]').value;
        if (!value1){return}   
        character.applyDamage(`-${value1}`);
      }
    },
    temp: {
      label: `Temporary <i class="fa-solid fa-shield-plus"></i>`,
      callback: async (html) => {
        const value1 = html[0].querySelector('input[name=damagetaken]').value;
        if (!value1){return}   
        await character.applyTempHP(value1);
      }
    },
},

default: "damage"
}).render(true);

async function arcaneWardDamage(damageValue, actorWizard, arcaneWardValue) {
  if (arcaneWardValue > 0) {
      let damageRemaining = damageValue - arcaneWardValue;
      const valuePath = `system.resources.${wardKey}.value`;
      if (damageRemaining > 0) {
          await actorWizard.update({[valuePath]: 0});
          await actorWizard.applyDamage(damageRemaining);
      }
      else {
          await actorWizard.update({[valuePath]: arcaneWardValue - damageValue});
      }
  }

  else {
      await actorWizard.applyDamage(damageValue);
  };

};