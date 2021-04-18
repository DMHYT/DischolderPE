# DischolderPE
### Порт мода Discholder с Minecraft JE 1.16.5 на Minecraft PE 1.16.200 на InnerCore 2.0+ / Horizon
***
## Использование публичного API мода
### Мод DischolderPE предоставляет вам небольшое публичное API, которое вы можете использовать для создания своих подставок для дисков, или чтобы добавить другие предметы, которые можно будет положить на подставку (например, если у вас есть новые диски и пластинки в вашем моде)
### Чтобы получить доступ к API, напишите этот код:
```js
ModAPI.addAPICallback("DischolderCore", function(api){
    let Core = api.Core;
    // Создайте новый блок подставки для дисков
    // "superDischolder" - строковой id нового блока
    // "discholder.super" - ключ для перевода имени блока. Потом вы можете написать `Translation.addTranslation('discholder.super', {en: "Super Discholder", ru: "Супер-подставка для дисков"})`
    // Мод будет использовать текстуры двух блоков для создания модельки, в самом моде это дубовые доски и все цвета шерсти
    // Следующие параметры по порядку: id_основного_блока, data_основного_блока, id_блока_покрытия, data_блока_покрытия
    // Подставка для дисков крафтится из определённого деревянного забора и плиты. Укажите их id для вашей подставки для дисков в последних двух параметрах.
    Core.create("superDischolder", "discholder.super", BlockID.superPlanks, 0, BlockID.superWool, 0, BlockID.superFence, BlockID.superSlab);
    // После вызова этого метода, вы сможете положить предмет с данными id и data в подставку для дисков.
    Core.addDisc(ItemID.mySuperDisc, 0);
});
```
***
## Использование деклараций TypeScript для публичного API
### Если вы пишете мод на TypeScript, или вы просто хотите иметь подсказки к публичному API мода DischolderPE, вы можете взять TS декларации отсюда в проект вашего мода. Вы можете найти их [здесь](tools/declarations/DischolderCore.d.ts) или скачать из релиза.
***
## Дополнительная информация
### [Мой VK](https://vk.com/vstannumdum)
### [Мой YouTube канал](https://youtube.com/c/DMH_Minecraft)
### [Группа VK](https://vk.com/dmhmods) (сообщайте о багах туда)