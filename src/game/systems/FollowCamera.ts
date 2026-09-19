import Phaser from 'phaser';
import { CAMERA_CONFIG as C } from '../config/player';

export class FollowCamera {
  private lookAhead = 0;
  constructor(private camera: Phaser.Cameras.Scene2D.Camera, private target: Phaser.Physics.Arcade.Sprite, width: number, height: number) {
    camera.setBounds(0, 0, width, height).setDeadzone(C.deadZoneWidth, C.deadZoneHeight);
    camera.startFollow(target, false, C.horizontalSmoothing, C.verticalSmoothing);
    this.reset();
  }
  update(delta: number, velocityX: number) {
    const target = Math.abs(velocityX) > 25 ? Math.sign(velocityX) * C.lookAhead : 0;
    this.lookAhead = Phaser.Math.Linear(this.lookAhead, target, 1 - Math.exp(-delta / 240));
    this.camera.setFollowOffset(-this.lookAhead, C.verticalOffset);
    // Follow interpolation remains comparable at 30, 60, or 120 Hz.
    this.camera.setLerp(1 - Math.pow(1 - C.horizontalSmoothing, delta / (1000 / 60)), 1 - Math.pow(1 - C.verticalSmoothing, delta / (1000 / 60)));
  }
  reset() { this.lookAhead = 0; this.camera.setFollowOffset(0, C.verticalOffset); this.camera.centerOn(this.target.x, this.target.y - C.verticalOffset); }
}
