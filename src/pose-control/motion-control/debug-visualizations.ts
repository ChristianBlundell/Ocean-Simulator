import { Entity, Vec3, Color } from "playcanvas"
import { entity, Box, E } from "../../entities"
import { setTransform, zxy } from "../../math"
import { material } from "../../utils"
import { KeypointMap, KeypointName } from "./keypoints"
import { HumanPoseDetector } from "./human-pose-detector"

export class DebugVisualizations {
    private rotateMeter!: HTMLDivElement
    private debugCubes!: Partial<KeypointMap<Entity>>
    
    public readonly entity: Entity

    constructor(public readonly poseDetection: HumanPoseDetector) {
        this.rotateMeter = document.createElement('div')
        document.body.appendChild(this.rotateMeter)
        this.rotateMeter.style.position = 'absolute'
        this.rotateMeter.style.left = '50px'
        this.rotateMeter.style.top = '50px'
        this.rotateMeter.style.width = '200px'
        this.rotateMeter.style.height = '30px'
        this.rotateMeter.style.rotate = '20deg'
        this.rotateMeter.style.background = 'green'
        this.rotateMeter.style.color = 'white'
        this.rotateMeter.style.textAlign = 'center'
        this.rotateMeter.style.borderTop = '10px solid yellow'
        //this.rotateMeter.style.display = 'none'

        this.entity = E()

        const debugContainer = entity({
            parent: this.entity,
            transform: {
                position: new Vec3(0, 0, 0),
                scale: new Vec3(5, 5, 5),
                rotation: new Vec3(180, 0, 0)
            }
        })

        const debugColors: Color[] = [
            new Color(0.3, 0.3, 0.3),
            new Color(0.35, 0, 0),
            new Color(0, 0.3, 0),
            new Color(0, 0, 0.4),
            new Color(0, 0, 0),
        ]

        this.debugCubes =
            Object.fromEntries(
                ([
                    "left_hip",
                    "left_shoulder",
                    "left_elbow",
                    "left_wrist",
                    "left_eye",

                    "right_hip",
                    "right_shoulder",
                    "right_elbow",
                    "right_wrist",
                    "right_eye",
                ] as KeypointName[])
                    .map((debugKeypointName, i) =>
                            [debugKeypointName, Box({
                                parent: debugContainer,
                                transform: {
                                    scale: new Vec3(0.1, 0.1, 0.1)
                                },
                                material: material({
                                    diffuse: new Color().lerp(
                                        Color.BLACK,
                                        debugColors[i % debugColors.length],
                                        Math.floor(i / debugColors.length) + 1
                                    )
                                })
                            })]
                        )
                )
    }

    update() {
        // Update the debug cubes' positions to match their corresponding keypoints' positions
        if (this.poseDetection.keypoints3D)
            for (const [keypointKey, debugCube] of Object.entries(this.debugCubes!))
                if ((this.poseDetection.keypoints3D as any)[keypointKey])
                    setTransform(debugCube, {
                        position: zxy((this.poseDetection.keypoints3D as any)[keypointKey])
                    });
        
        if (this.poseDetection.humanPoseAngles?.head) {
            this.rotateMeter.style.background = 'blue'
            this.rotateMeter.style.rotate = `${this.poseDetection.humanPoseAngles.head.y}deg`
            console.log(this.poseDetection.humanPoseAngles.head.y)
        }
        else {
            this.rotateMeter.style.background = 'green'
        }

        // Update the FPS for computing pose angles
        this.rotateMeter.innerHTML = `${this.poseDetection.fps.toFixed(0)} fps`
    }
}