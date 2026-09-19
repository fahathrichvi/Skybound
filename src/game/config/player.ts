export interface PlayerConfig {
  walkSpeed: number; runSpeed: number; acceleration: number; drag: number;
  airControl: number; airDrag: number; jumpVelocity: number; gravity: number;
  maxFallSpeed: number; coyoteMs: number; jumpBufferMs: number; jumpCutMultiplier: number;
}
export const PLAYER_CONFIG: Readonly<PlayerConfig> = {
  walkSpeed: 260, runSpeed: 410, acceleration: 2500, drag: 3100,
  airControl: .72, airDrag: 850, jumpVelocity: 660, gravity: 1550,
  maxFallSpeed: 900, coyoteMs: 120, jumpBufferMs: 130, jumpCutMultiplier: .45,
};
export const CAMERA_CONFIG = { lookAhead: 105, horizontalSmoothing: .085, verticalSmoothing: .065, deadZoneWidth: 150, deadZoneHeight: 150, verticalOffset: 95 } as const;
