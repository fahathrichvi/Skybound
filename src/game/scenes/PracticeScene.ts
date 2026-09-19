import { GameBridge } from '../bridge';
import { PRACTICE_LEVEL } from '../levels/practice';
import { LevelScene } from './LevelScene';

/** Keep the Stage 2 test course on the same controller and collision pipeline. */
export class PracticeScene extends LevelScene {
  constructor(bridge: GameBridge, reducedMotion: boolean) { super(bridge, reducedMotion, PRACTICE_LEVEL, 'Practice'); }
}
