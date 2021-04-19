Discholder.addDisc(830, 0); // 13
Discholder.addDisc(750, 0); // cat
Discholder.addDisc(723, 0); // blocks
Discholder.addDisc(752, 0); // chirp
Discholder.addDisc(749, 0); // far
Discholder.addDisc(859, 0); // mall
Discholder.addDisc(748, 0); // mellohi
Discholder.addDisc(756, 0); // stal
Discholder.addDisc(747, 0); // strad
Discholder.addDisc(745, 0); // ward
Discholder.addDisc(744, 0); // 11
Discholder.addDisc(818, 0); //wait
Discholder.addDisc(857, 0); //pigstep

(() => {
    let group: number[] = [];
    let colors: string[] = ["white", "orange", "magenta", "lightblue", "yellow", "lime", "pink", "gray", "lightgray", "cyan", "purple", "blue", "brown", "green", "red", "black"];
    for(let i in colors) group.push(Discholder.create(`${colors[i]}Discholder`, `discholder.${colors[i]}`, 5, 0, 35, parseInt(i), 85, 158));
    Item.addCreativeGroup("discholders", Translation.translate("group.discholders"), group);
})();

ModAPI.registerAPI("DischolderCore", {
    Core: Discholder,
    requireGlobal(command: any){
        return eval(command);
    }
});