import { Application, Color, Entity, StandardMaterial, Vec3 } from "playcanvas"
import { entity, XYZArrows } from "./entities"
import { RotateScript, useScript } from "./utils"
import * as playground from './playground'

export function game(app: Application) {
    // Some of this code was adapted from the PlayCanvas engine template at:
    // https://github.com/playcanvas/engine/blob/main/README.md#usage

    app.systems.rigidbody.gravity.set(0, 0, -3)
    // const world = app.systems.rigidbody.dynamicsWorld as Ammo.btDynamicsWorld
    // world.setInternalTickCallback

    const wetsuit = new StandardMaterial()
    wetsuit.diffuse.set(0.3, 0.3, 0.3)
    wetsuit.specular.set(0.09, 0.1, 0.07)
    wetsuit.update()

    const skin = new StandardMaterial()
    skin.diffuse.set(0.6, 0.5, 0.1)
    skin.update()

    // playground.teleportedRigidBody(app.root)
    // playground.box2(app.root)
    // playground.moveableBox(app.root)
    // playground.hinges(app.root)
    // playground.hinges2(app.root)
    // playground.hinges3(app.root)
    // playground.hinges4(app.root)
    // playground.hinges5(app.root)
    // playground.hinges6(app.root)
    // playground.hinges7(app.root)
    // playground.hinges8(app.root)
    // playground.hinges10(app.root)
    // playground.hinges11(app.root)
    // playground.coneTwist1(app.root)
    // playground.coneTwist2(app.root)
    // playground.coneTwist3(app.root)
    // playground.coneTwist4(app.root)
    // playground.coneTwist5(app.root)
    // playground.capsule(app.root)
    // playground.rotatedArrows(app.root)
    // playground.rotationAxes(app.root)
    playground.gridXY(app.root)
    playground.gridYZ(app.root)
    playground.ground(app.root)
    // playground.finger(app.root)
    // playground.hand(app.root)
    // playground.arm(app.root)
    // playground.armsLR(app.root)
    playground.diver(app.root)
    // playground.mirroredRB_2(app.root)
    // playground.LR1(app.root)
    // playground.bird(app.root)
    // playground.sphere(app.root)
    // playground.reparent1(app.root)

    XYZArrows({
        parent: app.root,
        transform: {
            position: new Vec3(0, 0, -1)
        }
    })

    // const diver = Diver({
    //     parent: app.root,
    //     skin, wetsuit,
    //     ...diverConfigs.personA,
    //     tags: [TAG_FLUID_COLLIDABLE],
    //     transform: {
    //         position: new Vec3(0, 0, 5)
    //     }
    // })
    // diver.addComponent('script')
    // diver.script!.create(useScript(PoseCopier))

    // fluidSim.Detector({ parent: app.root })

    // create camera entity
    const cameraRoot = entity({ parent: app.root })
    
    cameraRoot.addComponent('script')
    cameraRoot.script!.create(useScript(RotateScript), {
        attributes: {
            speed: 0
        }
    })
    const camera = entity({
        parent: cameraRoot,
        transform: {
            // position: new Vec3(4, -3, 3)
            // position: new Vec3(5, -2, 2)
            position: new Vec3(9, -1, 2)
            // position: new Vec3(-20, -4, 5)
            // position: new Vec3(12, 0, 15)
        }
    })
    camera.addComponent('camera', {
        clearColor: new Color(0.1, 0.1, 0.1)
    })
    
    // camera.rotateLocal(70, 0, 90)
    camera.lookAt(new Vec3(0, 0, 1), Vec3.BACK)
    // camera.lookAt(new Vec3(0, 1, 5), Vec3.BACK)
    //camera.lookAt(diver.getPosition(), Vec3.BACK)

    // create lights
    const light = new Entity('light')
    light.addComponent('light')
    light.light!.castShadows = true
    light.light!.type = "omni"
    light.light!.intensity = 2
    app.root.addChild(light)
    light.setPosition(-3, 3, 6)

    const light2 = new Entity('light')
    light2.addComponent('light')
    light2.light!.type = "directional"
    light2.light!.intensity = 0.8
    light2.light!.castShadows = true
    app.root.addChild(light2)
    light2.setEulerAngles(10, 0, -25)
    light2.setPosition(-3, 10, 5)
}