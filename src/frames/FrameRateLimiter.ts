/**
 * Controls whether a frame should be rendered based on a target FPS.
 */
export class FrameRateLimiter {
    private targetFps: number | undefined;
    private frameIntervalMs = 0;
    private lastFrameTime = 0;

    public constructor(targetFps?: number) {
        this.setTargetFps(targetFps);
    }

    /**
     * set the desired frame rate.
     * pass `undefined` for an unlimited frame rate
     * (i.e., to allow every requestAnimationFrame callback to render.)
     */
    public setTargetFps(fps: number | undefined) {
        if (fps !== undefined && fps <= 0) {
            throw new Error('target FPS must be greater than 0');
        }

        this.targetFps = fps;
        this.frameIntervalMs = fps === undefined ? 0 : 1000 / fps;
        this.lastFrameTime = 0;
    }

    /**
     * get the currently configured target frame rate,
     * where `undefined` means unlimited.
     */
    public getTargetFps() {
        return this.targetFps;
    }

    /**
     * reset frame timing.
     */
    public reset() {
        this.lastFrameTime = 0;
    }

    /**
     * return true when enough time has passed to render another frame.
     * this sets the latest frame run to the given timestamp.
     */
    public shouldRunFrame(timestamp: number) {
        if (this.frameIntervalMs === 0) {
            this.lastFrameTime = timestamp;
            return true;
        }

        if (this.lastFrameTime === 0) {
            this.lastFrameTime = timestamp;
            return true;
        }

        const elapsed = timestamp - this.lastFrameTime;
        if (elapsed < this.frameIntervalMs) {
            return false;
        }

        this.lastFrameTime = timestamp;
        return true;
    }
}