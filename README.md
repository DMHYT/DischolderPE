### [-> Russian <-](README.ru.md)
# DischolderPE
### Port of the Discholder mod from Minecraft JE 1.16.5 to Minecraft PE 1.16.200 on InnerCore 2.0+ / Horizon
***
## Using shared ModAPI
### DischolderPE mod provides you with a small shared API, which you can use to create new discholder blocks, or add another items to be put in the discholder (for example, if you have new music discs in your mod)
### To get access to the API, you need to write this code:
```js
ModAPI.addAPICallback("DischolderCore", function(api){
    let Core = api.Core;
    // Create new discholder block
    // "superDischolder" - string id of the new block
    // "discholder.super" - translation key for this block's name. Then you can write `Translation.addTranslation('discholder.super', {en: "Super Discholder", ru: "Супер-подставка для дисков"})`
    // Mod will use textures of two blocks to create model, by default these are oak planks and all colors of the wool
    // Next params in order: base_block_id, base_block_data, cover_block_id, cover_block_data
    // Discholder is crafted of definite wood fence and slab. Specify their ids for your discholder in last two params.
    Core.create("superDischolder", "discholder.super", BlockID.superPlanks, 0, BlockID.superWool, 0, BlockID.superFence, BlockID.superSlab);
    // After calling this method, you will be able to put item with given id and data in the discholder.
    Core.addDisc(ItemID.mySuperDisc, 0);
});
```
***
## Using TypeScript declarations for shared API
### If you write your mod on TypeScript, or you just want to have hints for the DischolderPE shared API, then you can take TS declarations from here to your mod project. You can find them [here](tools/declarations/DischolderCore.d.ts) or download from the release.
***
## Additional information
### [My VK](https://vk.com/vstannumdum)
### [My YouTube channel](https://youtube.com/c/DMH_Minecraft)
### [VK group](https://vk.com/dmhmods) (report bugs there)