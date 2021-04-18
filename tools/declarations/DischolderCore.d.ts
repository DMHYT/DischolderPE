/// <reference path="./core-engine.d.ts" />
interface DischolderCore {
    /**
     * Function to setup discholder's rotatable model from given planks and wool block ids and datas.
     * Mostly for internal use!!!
     */
    setupModel(id: number, planksId: number, planksData: number, materialId: number, materialData: number): void;
    /**
     * Function to setup discholder TileEntity prototype for block with given id.
     * Mostly for internal use!!!
     */
    setupTile(id: number): void;
    /**
     * Creates discholder block with given string id.
     * Setups rotatable model from given planks and wool block ids and datas, and creates TileEntity prototype.
     * @param fenceId id of the fence that will be put in crafting recipe of the block
     * @param slabId if of the slab that will be put in crafting recipe of the block
     * @returns created block's numeric id
     */
    create(id: string, nameKey: string, planksId: number, planksData: number, materialId: number, materialData: number, fenceId: number, slabId: number): number;
    /**
     * Valid discs ids object. Mostly for internal use!!!
     */
    readonly DISCS: {[key: string]: boolean};
    /**
     * Makes item with given id and data valid for putting in the discholder
     */
    addDisc(id: number, data: number): void;
    /**
     * @returns whether item with given id and data is valid for putting in the discholder
     */
    isDisc(id: number, data: number): boolean;
    /**
     * Makes item with given id and data invalid for putting in the discholder
     */
    removeDisc(id: number, data: number): void;
}
export namespace ModAPI {
    /**ModAPI callback for Discholder */
    function addAPICallback(apiName: "DischolderCore", func: (api: {Core: DischolderCore, requireGlobal(command: any): any}) => void): void;
}