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

/**
 * For handling block's movements by pistons
 */
namespace PistonHandler {

    export type Data = [Nullable<Vector>, boolean];

    export function handle(x: number, y: number, z: number, region: BlockSource, id: number): Data {
        let sides: [number, number, number][] = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
        let neededSide: [number, number, number] = null;
        for(let side of sides){
            if(region.getBlockId(x + side[0], y + side[1], z + side[2]) == id) neededSide = side;
        }
        if(neededSide == null) return [null, false];
        let xx: number = neededSide[0] != 0 ? neededSide[0] : 0;
        let yy: number = neededSide[1] != 0 ? neededSide[1] : 0;
        let zz: number = neededSide[2] != 0 ? neededSide[2] : 0;
        for(let a=-1; a<2; a+=2){
            for(let i=1; i<=13; i++){
                let potentialPiston = region.getBlockId(x + (xx * i * a), y + (yy * i * a), z + (zz * i * a));
                if(potentialPiston == 33 || potentialPiston == 29){
                    return [{x: x + neededSide[0], y: y + neededSide[1], z: z + neededSide[2]}, true];
                }
            }
        }
        
        return [null, false];
    }

    export function postHandle(region: BlockSource, data: Data, oldTile: TileEntity): void {
        let newTile = TileEntity.getTileEntity(data[0].x, data[0].y, data[0].z, region) || TileEntity.addTileEntity(data[0].x, data[0].y, data[0].z, region);
        for(let i=0; i<7; i++){
            let slot = oldTile.container.getSlot("slot" + i);
            if(slot.id != 0) newTile.container.setSlot("slot" + i, slot.id, slot.count, slot.data, slot.extra);
        }
        oldTile.data.movedByPiston = true;
        TileEntity.destroyTileEntity(oldTile);
    }

}

namespace Discholder {

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
            let yaw = Math.abs(Entity.getLookAngle(player).yaw * 180 / Math.PI);
            let data = yaw <= 135 && yaw > 45 ? 0 : 1;
            let bottom = region.getBlock(coords.relative.x, coords.relative.y - 1, coords.relative.z);
            let on = region.getBlock(coords.relative.x, coords.relative.y, coords.relative.z);
            if(!World.canTileBeReplaced(bottom.id, bottom.data) && (on.id == 0 || World.canTileBeReplaced(on.id, on.data))){
                region.setBlock(coords.relative.x, coords.relative.y, coords.relative.z, id, data);
            } else region.spawnDroppedItem(coords.relative.x + .5, coords.relative.y + .5, coords.relative.z + .5, item.id, 1, item.data, item.extra);
        });
        Block.setShape(id, 0, 0, 0, 1, 6 / 16, 1);
        const shape = new ICRender.CollisionShape();
        shape.addEntry().addBox(0, 0, 0, 1, 6 / 16, 1);
        BlockRenderer.setCustomCollisionShape(id, -1, shape);
    }

    export function setupTile(id: number): void {
        TileEntity.registerPrototype(id, {
            useNetworkItemContainer: true,
            defaultValues: {
                movedByPiston: false
            },
            client: {
                updateModel(){
                    let blockData = World.getBlockData(this.x, this.y, this.z);
                    if(blockData == 1919221760) blockData = 0;
                    for(let i=0; i<7; i++){
                        if(this["model" + i]) this["model" + i].destroy();
                        let xx = this.x + (blockData == 0 ? 1 - (5/32 + 1/8 * i) : 19/32);
                        let zz = this.z + (blockData == 1 ? 1 - (3/32 + 1/8 * i) : 19/32);
                        let yy = this.y + 7/16;
                        this["model" + i] = new Animation.Item(xx, yy, zz);
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
                coords.x = coords.x >= 0 ? coords.x : 8 + coords.x;
                coords.z = coords.z >= 0 ? coords.z : 8 + coords.z;
                if(blockData == 0){
                    if(coords.x < 0.09375 || coords.x > 7.90625) return -1;
                    return 6 - Math.floor(coords.x - 1);
                } else {
                    if(coords.z < 0.09375 || coords.z > 7.90625) return -1;
                    return 6 - Math.floor(coords.z - 1);
                }
            },
            click(id: number, count: number, data: number, coords: Callback.ItemUseCoordinates, player: number, extra: ItemExtraData){
                let slot: number = this.getSlotFromVec(coords.vec);
                if(slot != -1 && slot < 7){
                    if(Discholder.isDisc(id, data)){
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
                if(this.data.movedByPiston){
                    for(let i=0; i<7; i++){
                        this.container.setSlot("slot" + i, 0, 0, 0, null);
                    }
                    return false;
                }
                let handleData: PistonHandler.Data = PistonHandler.handle(this.x, this.y, this.z, this.blockSource, id);
                if(handleData[1]){
                    PistonHandler.postHandle(this.blockSource, handleData, this);
                    return true;
                }
            }
        });
    }

    export function create(id: string, nameKey: string, planksId: number, planksData: number, materialId: number, materialData: number, fenceId: number, slabId: number): number {
        IDRegistry.genBlockID(id);
        Block.createBlock(id, [
            {name: nameKey, texture: [["planks", 0]], inCreative: true}, 
            {name: nameKey, texture: [["planks", 0]], inCreative: false}
        ], {base: 5, sound: "wood"});
        ToolAPI.registerBlockMaterial(BlockID[id], "wood", 0, false);
        Block.setDestroyTime(BlockID[id], 4);
        Block.registerDropFunction(id, function(coords, blockID, blockData, level, enchant, item, region){
            return [[blockID, 1, 0]];
        });
        Block.registerNeighbourChangeFunction(BlockID[id], function(coords, block, changedCoords, region){
            if(coords.x == changedCoords.x && coords.z == changedCoords.z && coords.y == changedCoords.y + 1){
                if(!GenerationUtils.isTerrainBlock(region.getBlockId(changedCoords.x, changedCoords.y, changedCoords.z))){
                    region.destroyBlock(coords.x, coords.y, coords.z, true);
                }
            }
        });
        Item.setCategory(BlockID[id], Native.ItemCategory.DECORATION);
        setupModel(BlockID[id], planksId, planksData, materialId, materialData);
        setupTile(BlockID[id]);
        Callback.addCallback("PostLoaded", function(){
            Recipes.addShaped({id: BlockID[id], count: 1, data: 0}, ["   ", "fwf", "sss"], ['f', fenceId, 0, 'w', materialId, materialData, 's', slabId, 0]);
        });
        return BlockID[id];
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