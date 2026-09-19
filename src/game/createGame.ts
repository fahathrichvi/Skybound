import Phaser from 'phaser';
import { GAME_SIZE } from '../config/project';
import { GameBridge } from './bridge';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PracticeScene } from './scenes/PracticeScene';
import { PLAYER_CONFIG } from './config/player';
import { LevelScene } from './scenes/LevelScene';
import { getLevelDefinition } from './levels';

export function createGame(parent: HTMLElement, bridge: GameBridge, reducedMotion: boolean, course = '1-1') {
  return new Phaser.Game({ type: Phaser.AUTO, parent, ...GAME_SIZE, backgroundColor: '#173b36',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { x: 0, y: PLAYER_CONFIG.gravity }, debug: import.meta.env.DEV && new URLSearchParams(location.search).get('debug') === 'true' } },
    render: { antialias: true, pixelArt: false }, input: { gamepad: true },
    scene: [new BootScene(), new PreloadScene(bridge, course === 'practice' ? 'Practice' : 'Level'), new MainMenuScene(bridge, reducedMotion), new PracticeScene(bridge, reducedMotion), new LevelScene(bridge, reducedMotion, getLevelDefinition(course))],
  });
}
