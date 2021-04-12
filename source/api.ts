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
                [[(0.5 + 2 * xx) / 16, 3 / 16, 3 / 16], [(1.5 + 2 * xx) / 16, 4 / 16, 13 / 16], materialId, materialData]
            );
        }
        const render1 = new ICRender.Model(ModelRotation.putBoxesToModel(boxes));
        const render2 = new ICRender.Model(ModelRotation.rotateModel(boxes));
        BlockRenderer.setStaticICRender(id, 0, render1);
        BlockRenderer.setStaticICRender(id, 1, render2);
        ItemModel.getFor(id, 0).setModel(render1);
        ItemModel.getFor(id, 1).setModel(render2);
        Block.registerPlaceFunction(id, function(coords, item, block, player, region){
            if(coords.side == 0){
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
        BlockRenderer.setCustomRaycastShape(id, -1, new ICRender.CollisionShape());
    }

    export function setupTileEntity(id: number): void {
        //TODO
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

}