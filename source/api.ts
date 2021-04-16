/**
 * Just for rotation model by 90 degrees CCW by Y-axis
 */
namespace ModelRotation {

    type Vertex = [number, number, number];
    type Box = [Vertex, Vertex, number, number];
    export type BoxSet = Box[];

    export function rotateVertex(vertex: Vertex): Vertex {
        let x = vertex[0], y = vertex[1], z = vertex[2];
        x -= 0.5, z -= 0.5;
        x = z;
        z = -(1 * (vertex[0] - 0.5));
        x += 0.5, z += 0.5;
        return [x, y, z];
    }

    export function rotateBox(box: Box): Box {
        return [rotateVertex(box[0]), rotateVertex(box[1]), box[2], box[3]];
    }

    export function rotateBoxes(boxes: BoxSet): BoxSet {
        let result: BoxSet = [];
        for(let box of boxes){
            result.push(rotateBox(box));
        }
        return result;
    }

    export function putBoxesToModel(boxes: BoxSet): BlockRenderer.Model {
        const model = new BlockRenderer.Model();
        for(let box of boxes)
            model.addBox(box[0][0], box[0][1], box[0][2], box[1][0], box[1][1], box[1][2], box[2], box[3]);
        return model;
    }

    export function rotateModel(boxes: BoxSet): BlockRenderer.Model {
        return putBoxesToModel(rotateBoxes(boxes));
    }

}

namespace DiscHolder {

    export function setupModel(id: number, planksId: number, planksData: number, materialId: number, materialData: number): void {
        const boxes: ModelRotation.BoxSet = [
            [[1.5 / 16, 0.1 / 16, 3 / 16], [14.5 / 16, 0.9 / 16, 4 / 16], planksId, planksData],
            [[1.5 / 16, 0.1 / 16, 12 / 16], [14.5 / 16, 0.9 / 16, 13 / 16], planksId, planksData]
        ]
        for(let xx=0; xx<8; xx++){
            boxes.push(
                [[(0.5 + 2 * xx) / 16, 1 / 16, 2 / 16], [(1.5 + 2 * xx) / 16, 6 / 16, 3 / 16], materialId, materialData],
                [[(0.5 + 2 * xx) / 16, 1 / 16, 13 / 16], [(1.5 + 2 * xx) / 16, 6 / 16, 14 / 16], materialId, materialData],
                [[(0.5 + 2 * xx) / 16, 3 / 16, 3 / 16], [(1.5 + 2 * xx) / 16, 4 / 16, 13 / 16], materialId, materialData],
                [[(0.5 + 2 * xx) / 16, 0, 1 / 16], [(1.5 + 2 * xx) / 16, 1 / 16, 15 / 16], planksId, planksData]
            );
        }
        const render1 = new ICRender.Model(ModelRotation.putBoxesToModel(boxes));
        const render2 = new ICRender.Model(ModelRotation.rotateModel(boxes));
        BlockRenderer.setStaticICRender(id, 0, render1);
        BlockRenderer.setStaticICRender(id, 1, render2);
        ItemModel.getFor(id, 0).setModel(render1);
        ItemModel.getFor(id, 1).setModel(render2);
        Block.registerPlaceFunction(id, function(coords, item, block, player, region){
            if(coords.side == 1){
                let yaw = Math.abs(Entity.getLookAngle(player).yaw * 180 / Math.PI);
                if(yaw <= 135 && yaw > 45) region.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, id, 0);
                else if(yaw <= 45 || yaw > 135) region.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, id, 1);
                else throw new java.lang.IllegalStateException("Invalid entity look angle!"); //for debug
            }
        });
        Block.setShape(id, 0, 0, 0, 1, 6 / 16, 1);
        const shape = new ICRender.CollisionShape();
        shape.addEntry().addBox(0, 0, 0, 1, 6 / 16, 1);
        BlockRenderer.setCustomCollisionShape(id, -1, shape);
    }

    export function setupTileEntity(id: number): void {
        TileEntity.registerPrototype(id, {
            useNetworkItemContainer: true,
            client: {
                updateModel(){
                    let blockData = World.getBlockData(this.x, this.y, this.z);
                    Debug.m(blockData);
                    for(let i=0; i<7; i++){
                        if(this["model" + i]) this["model" + i].destroy();
                        this["model" + i] = new Animation.Item(this.x + 1 - (1/8 + 1/16 + (blockData == 1919221760 ? 1/8 * i : 2.5/8)), this.y + 0.5, this.z + 1 - (1/8 + 1/16 + (blockData == 1 ? 1/8 * i : 2.5/8)));
                        let id = Network.serverToLocalId(this.networkData.getInt("animId" + i));
                        let data = this.networkData.getInt("animData" + i);
                        this["model" + i].describeItem({
                            id: id, count: 1, data: data, size: 1,
                            rotation: [0, blockData == 1 ? 0 : Math.PI / 2, 0]
                        });
                        this["model" + i].load();
                    }
                },
                load(){
                    this.updateModel();
                    let that = this;
                    this.networkData.addOnDataChangedListener(function(networkData: SyncedNetworkData, isExternalChange: boolean){
                        that.updateModel();
                    });
                },
                unload(){
                    for(let i=0; i<7; i++){
                        this["model" + i].destroy();
                    }
                }
            },
            setSlot(slot: string, id: number, count: number, data: number, extra: ItemExtraData){
                this.container.setSlot(slot, id, count, data, typeof extra !== "undefined" ? extra : null);
                this.container.sendChanges();
            },
            tick(){
                for(let i=0; i<7; i++){
                    let slot = this.container.getSlot("slot" + i);
                    this.networkData.putInt("animId" + i, slot.id);
                    this.networkData.putInt("animData" + i, slot.data);
                    this.networkData.sendChanges();
                }
            },
            getSlotFromVec(coords: Vector): number {
                let blockData = this.blockSource.getBlockData(this.x, this.y, this.z);
                coords.x %= 1, coords.z %= 1;
                coords.x *= 8, coords.z *= 8;
                coords.x = Math.abs(coords.x); coords.z = Math.abs(coords.z);
                Debug.m(coords.x + ", " + coords.z);
                if(blockData == 0){
                    if(coords.x < 0.5 || coords.x > 7.5) return -1;
                    return Math.floor(coords.x - 1);
                } else {
                    if(coords.z < 0.5 || coords.z > 7.5) return -1;
                    return Math.floor(coords.z - 1);
                }
            },
            click(id: number, count: number, data: number, coords: Callback.ItemUseCoordinates, player: number, extra: ItemExtraData){
                let slot: number = this.getSlotFromVec(coords.vec)
                Debug.m("Item: " + id + ", " + count + ", " + data)
                Debug.m("Slot is " + slot)
                if(slot != -1){
                    if(id != 0){//temporarily
                        if(this.container.getSlot("slot" + slot).id == 0){
                            this.setSlot("slot" + slot, id, 1, data, extra);
                            Entity.setCarriedItem(player, id, count - 1, data, extra);
                        }
                    } else if(id == 0) {
                        if(this.container.getSlot("slot" + slot).id != 0){
                            let slt = this.container.getSlot("slot" + slot)
                            Entity.setCarriedItem(player, slt.id, 1, slt.data, slt.extra);
                            this.setSlot("slot" + slot, 0, 0, 0, null);
                        }
                    }
                }
            },
            destroy(){
                for(let i=0; i<7; i++){
                    if(this["model" + i]) this["model" + i].destroy();
                }
            }
        });
    }

    export function create(id: string, nameKey: string, planksId: number, planksData: number, materialId: number, materialData: number, fenceId: number, slabId: number): void {
        IDRegistry.genBlockID(id);
        Block.createBlock(id, [{name: nameKey, texture: [["unknown", 0]], inCreative: true}, {name: nameKey, texture: [["unknown", 0]], inCreative: false}]);
        ToolAPI.registerBlockMaterial(BlockID[id], "wood", 0, false);
        Block.setDestroyTime(BlockID[id], 40);
        setupModel(BlockID[id], planksId, planksData, materialId, materialData);
        setupTileEntity(BlockID[id]);
        Callback.addCallback("PostLoaded", function(){
            Recipes.addShaped({id: BlockID[id], count: 1, data: 0}, ["   ", "fwf", "sss"], ['f', fenceId, 0, 'w', materialId, materialData, 's', slabId, 0]);
        });
    }

    export const DISCS: {[key: string]: boolean} = {};

    export function addDisc(id: number, data: number): void {
        if(!DISCS[id + ":" + data]) DISCS[id + ":" + data] = true;
    }

    export function isDisc(id: number, data: number): boolean {
        return DISCS[id + ":" + data];
    }

    export function removeDisc(id: number, data: number): void {
        if(DISCS[id + ":" + data]) DISCS[id + ":" + data] = false;
    }

}