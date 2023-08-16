import { BlazePoseMediaPipeEstimationConfig, BlazePoseMediaPipeModelConfig, createDetector, Pose, PoseDetector, SupportedModels } from "@tensorflow-models/pose-detection";
import { Camera } from "./camera";
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'
import { Vec2, Vec3 } from "playcanvas";
import { newHumanPoseAngles, HumanPoseAngles } from "../human-pose-angles";
import { KeypointMap, updateKeypoints3D } from "./keypoints";
import { updateWithDeeplyPartial } from "../../utils";
import { BlazePoseNativeKeypointsUnprojector, StaticLimbLength3DKeypointsUnprojector, KeypointsUnprojector } from "./keypoints-unprojectors";
import { decomposeHumanPoseAngles } from "./human-pose-decomposition";

// The pose detection library was referenced in working on this file
// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/demos/live_video/src/index.js

export class HumanPoseDetector {
    private _latestRawPoses?: Pose[]
    private _keypoints3D: Partial<KeypointMap<Vec3>> = {}
    private _humanPoseAngles = newHumanPoseAngles()

    private _lastFrameRequest?: ReturnType<typeof requestAnimationFrame>
    private _msBetweenDetections: number[] = new Array(10)

    public get latestRawPoses() {
        return this._latestRawPoses
    }

    public get keypoints3D(): Partial<KeypointMap<Vec3>> {
        return this._keypoints3D
    }

    public get humanPoseAngles() {
        return this._humanPoseAngles
    }

    public get fps() {
        return this._msBetweenDetections.reduce((ms, acc) => ms + acc, 0) / this._msBetweenDetections.length
    }

    private constructor(
        private detector: PoseDetector,
        private camera: Camera,
        private unprojector: KeypointsUnprojector
    ) {
        setTimeout(() => this.reqFrame(), 1000)
    }

    private async reqFrame(ms?: number) {
        this._latestRawPoses = await this.detector.estimatePoses(
            this.camera.video, {
                enableSmoothing: true,
        } as BlazePoseMediaPipeEstimationConfig)

        if (this.latestRawPoses!.length > 0) {
            const unprojected = this.unprojector.unproject(this._latestRawPoses[0])

            updateKeypoints3D(unprojected, this._keypoints3D)
            updateWithDeeplyPartial(this._humanPoseAngles, decomposeHumanPoseAngles(this._keypoints3D))
        }

        this._lastFrameRequest = requestAnimationFrame((ms_new) => {
            const msBetweenDetections = ms ? (ms_new - ms) : 0
            this._msBetweenDetections.unshift(msBetweenDetections)
            this._msBetweenDetections.pop()

            this.reqFrame(ms_new)
        })
    }

    dispose() {
        if (this._lastFrameRequest)
            cancelAnimationFrame(this._lastFrameRequest)
        
        this.detector.dispose()
        this.camera.dispose()

        HumanPoseDetector.instance = undefined
    }

    static async getInstance(): Promise<HumanPoseDetector> {
        if (HumanPoseDetector.instance)
            return HumanPoseDetector.instance
        
        const detector = await createDetector(SupportedModels.BlazePose, {
            runtime: 'mediapipe',
            enableSmoothing: true,
            modelType: 'heavy',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose'
        } as BlazePoseMediaPipeModelConfig)
        const camera = new Camera()
        await camera.start()

        return HumanPoseDetector.instance = new HumanPoseDetector(
                detector,
                camera,
                new StaticLimbLength3DKeypointsUnprojector(),
                //new BlazePoseNativeKeypointsUnprojector(),
            )
    }

    private static instance?: HumanPoseDetector = undefined
}