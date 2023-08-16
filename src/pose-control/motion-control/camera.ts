
// The pose detection library was referenced in working on this file
// https://github.com/tensorflow/tfjs-models/blob/master/pose-detection/demos/live_video/src/camera.js

export class Camera {
    public readonly video: HTMLVideoElement
    private media?: MediaStream

    constructor() {
        this.video = document.createElement('video')
        this.video.addEventListener('loadeddata', async () => {
            await this.video.play()
        })
        document.body.append(this.video)
        this.video.style.position = 'absolute'
        this.video.style.right = '10px'
        this.video.style.top = '10px'
        this.video.style.width = '300px'
        this.video.style.opacity = '50%'
        this.video.style.scale = '-100% 100%'
    }

    async start() {
        this.media = await navigator.mediaDevices.getUserMedia({
            video: true,
        })

        this.video.srcObject = this.media
    }

    dispose() {
        this.video.remove()
    }
}