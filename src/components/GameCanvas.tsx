import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUp, Clock3, Diamond, Heart, MapPin, Pause, Play, RotateCcw, Sparkles, Trophy, Zap } from 'lucide-react';
import { GameBridge, type CombatSnapshot } from '../game/bridge';
import type { MoveAction } from '../game/entities/player/PlayerInput';
import type { Game } from 'phaser';
import type { ObjectSnapshot } from '../game/objects/ObjectProgress';
import type { LevelResult, RunSnapshot } from '../game/systems/RunProgress';
import { SaveService } from '../services/save';
import { AudioManager, type AudioSettings } from '../game/audio/AudioManager';
import type { BossSnapshot } from '../game/entities/bosses/BossSystem';

const EMPTY_OBJECTS: ObjectSnapshot = { shards: 0, totalShards: 0, gems: 0, totalGems: 0, respawn: { x: 0, y: 0 }, complete: false };
const EMPTY_COMBAT: CombatSnapshot = { hearts: 3, maxHearts: 3, lives: 3, maxLives: 3, deaths: 0, enemiesDefeated: 0, totalEnemies: 0 };
const EMPTY_RUN: RunSnapshot = { score: 0, elapsedMs: 0 };
type SavedResult = LevelResult & { bestScore: number; newBest: boolean };

export function GameCanvas({ reducedMotion, casualMode, audioSettings, active = true, course = '1-1' }: { reducedMotion: boolean; casualMode: boolean; audioSettings: AudioSettings; active?: boolean; course?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [bridge] = useState(() => new GameBridge());
  const [saveService] = useState(() => new SaveService());
  const [audio] = useState(() => new AudioManager());
  const [touchDevice] = useState(() => navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
  const isActive = useRef(active);
  const motionPreference = useRef(reducedMotion);
  const casualPreference = useRef(casualMode);
  const audioPreference = useRef(audioSettings);
  isActive.current = active;
  motionPreference.current = reducedMotion;
  casualPreference.current = casualMode;
  audioPreference.current = audioSettings;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [region, setRegion] = useState('');
  const [levelName, setLevelName] = useState('The Verdant Trail');
  const [levelId, setLevelId] = useState<string>(course);
  const [objects, setObjects] = useState<ObjectSnapshot>(EMPTY_OBJECTS);
  const [combat, setCombat] = useState<CombatSnapshot>(EMPTY_COMBAT);
  const [run, setRun] = useState<RunSnapshot>(EMPTY_RUN);
  const [boss, setBoss] = useState<BossSnapshot>();
  const [result, setResult] = useState<SavedResult>();
  const [gameOver, setGameOver] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [completed, setCompleted] = useState(false);
  const announcementTimer = useRef<number | undefined>(undefined);
  const practice = levelId === 'practice';
  const focusCanvas = () => host.current?.querySelector('canvas')?.focus({ preventScroll: true });
  useEffect(() => { bridge.send({ type: 'suspend', suspended: !active }); }, [active, bridge]);
  useEffect(() => { bridge.send({ type: 'preferences', reducedMotion, casualMode }); }, [reducedMotion, casualMode, bridge]);
  useEffect(() => { audio.setSettings(audioSettings); }, [audio, audioSettings]);
  useEffect(() => {
    let disposed = false;
    let game: Game | undefined;
    let resizeObserver: ResizeObserver | undefined;
    setReady(false); setProgress(0); setError(''); setPaused(false); setObjects(EMPTY_OBJECTS); setCombat(EMPTY_COMBAT); setRun(EMPTY_RUN); setResult(undefined); setGameOver(false); setSaveError(false); setCompleted(false);
    const unsubscribe = bridge.subscribe(event => {
      if (event.type === 'loading') setProgress(Math.round(event.progress * 100));
      if (event.type === 'ready') {
        setReady(true); bridge.send({ type: 'suspend', suspended: !isActive.current });
        bridge.send({ type: 'preferences', reducedMotion: motionPreference.current, casualMode: casualPreference.current });
        if (isActive.current) focusCanvas();
      }
      if (event.type === 'paused') setPaused(event.paused);
      if (event.type === 'error') setError(event.message);
      if (event.type === 'level') { setLevelName(event.name); setLevelId(event.id); }
      if (event.type === 'region') setRegion(event.name);
      if (event.type === 'objects') { setObjects(event.snapshot); if (!event.snapshot.complete) setCompleted(false); }
      if (event.type === 'combat') setCombat(event.snapshot);
      if (event.type === 'run') setRun(event.snapshot);
      if (event.type === 'boss') setBoss(event.snapshot.active ? event.snapshot : undefined);
      if (event.type === 'level-complete') {
        setObjects(event.snapshot); setCompleted(true); setGameOver(false);
        const saved = saveService.recordCompletion(event.result);
        setSaveError(!saved.persisted); setResult({ ...event.result, bestScore: saved.record.bestScore, newBest: saved.newBest });
      }
      if (event.type === 'sound') audio.play(event.cue);
      if (event.type === 'game-over') { setCombat(event.combat); setRun(event.run); setGameOver(true); }
      if (event.type === 'announcement') {
        setAnnouncement(event.message); window.clearTimeout(announcementTimer.current);
        announcementTimer.current = window.setTimeout(() => setAnnouncement(''), 1500);
      }
    });
    import('../game/createGame').then(({ createGame }) => {
      if (!disposed && host.current) {
        game = createGame(host.current, bridge, motionPreference.current, course);
        // Container changes (rotation/fullscreen) are not always window resize events.
        resizeObserver = new ResizeObserver(() => { game?.scale.refresh(); });
        resizeObserver.observe(host.current);
      }
    }).catch(() => { if (!disposed) setError('The game engine could not start. Refresh to try again.'); });
    return () => { disposed = true; unsubscribe(); window.clearTimeout(announcementTimer.current); resizeObserver?.disconnect(); game?.destroy(true); audio.destroy(); };
  }, [audio, bridge, course, saveService]);
  async function unlockAudio() { await audio.unlock(); audio.setSettings(audioPreference.current); audio.startMusic(); }
  function resume() { audio.play('menu'); bridge.send({ type: 'resume' }); focusCanvas(); }
  function restart() { audio.play('menu'); setCompleted(false); setGameOver(false); setResult(undefined); bridge.send({ type: 'restart' }); focusCanvas(); }
  function continueExploring() { setCompleted(false); bridge.send({ type: 'continue' }); focusCanvas(); }
  return <div className={`game-frame stage-seven${touchDevice ? ' has-touch' : ''}`} onPointerDown={() => void unlockAudio()}><div ref={host} className="canvas-host" />
    {!ready && <div className="loading" role="status"><span className="eyebrow">SKYBOUND ADVENTURE</span><h2>A world is waking up.</h2><progress value={progress} max={100} /><p>Loading {progress}%</p><small>Hold your jump to reach a little higher.</small></div>}
    {error && <p className="engine-error" role="alert">{error}</p>}
    {ready && <>
      <div className="practice-toolbar"><span><span className="live-dot" /> EMERALD VALLEY <small>{practice ? 'Movement practice / Stage 2' : `${levelId} / ${levelName}`}</small></span><div><button className="icon-button" onClick={restart} aria-label={practice ? 'Restart practice' : 'Restart trail'}><RotateCcw size={17} /></button><button className="icon-button" onClick={() => bridge.send({ type: 'pause' })} aria-label={practice ? 'Pause practice' : 'Pause trail'}><Pause size={17} /></button></div></div>
      {!practice && <><div className="region-label">{region}<small>SKYBOUND RUN / STAGE 7</small></div><div className="object-hud" aria-label="Level status"><span className="heart-row" aria-label={`${combat.hearts} of ${combat.maxHearts} hearts`}>{Array.from({ length: combat.maxHearts }, (_, index) => <Heart key={index} size={14} fill={index < combat.hearts ? 'currentColor' : 'none'} className={index < combat.hearts ? '' : 'empty-heart'} />)}{combat.lives === null ? <small>∞</small> : <small>× {combat.lives}</small>}</span><span><Sparkles size={15} /> {objects.shards}<small>/ {objects.totalShards}</small></span><span><Diamond size={15} /> {objects.gems}<small>/ {objects.totalGems}</small></span><span className="score-hud"><Trophy size={14} /> {run.score.toLocaleString()}</span>{objects.checkpointId && <span className="checkpoint-hud"><MapPin size={14} /> Checkpoint</span>}</div></>}
      {boss && !boss.defeated && <div className="boss-hud" aria-label={`${boss.name}, phase ${boss.phase}`}><span>{boss.name}<small>PHASE {boss.phase}</small></span><div><i style={{ width: `${boss.health / boss.maxHealth * 100}%` }} /></div></div>}
      {announcement && <div className="object-toast" role="status">{announcement}</div>}
      <div className="movement-hint"><kbd>A</kbd><kbd>D</kbd> move <span>/</span><kbd>Space</kbd> jump <span>/</span><kbd>Shift</kbd> sprint <span>/</span> click scene to focus</div>
      <div className="touch-controls" aria-label="Touch movement controls"><div><TouchButton action="left" label="Move left" bridge={bridge}><ArrowLeft /></TouchButton><TouchButton action="right" label="Move right" bridge={bridge}><ArrowRight /></TouchButton></div><div><TouchButton action="sprint" label="Sprint" bridge={bridge}><Zap /></TouchButton><TouchButton action="jump" label="Jump" bridge={bridge}><ArrowUp /></TouchButton></div></div>
      {paused && !completed && !gameOver && active && <div className="practice-paused" role="region" aria-label="Game paused" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); resume(); } }}><span className="eyebrow">TAKE A BREATHER</span><h2>A moment in the meadow.</h2><p>Your adventure will wait.</p><button autoFocus className="primary-button" onClick={resume}><Play size={16} /> {practice ? 'Resume practice' : 'Resume trail'}</button><button className="text-link" onClick={restart}><RotateCcw size={14} /> Restart level</button><Link className="text-link" to="/worlds">Return to world map</Link></div>}
      {completed && active && result && <div className="practice-paused completion-panel" role="region" aria-label="Level complete"><span className="eyebrow">THE TRAIL REMEMBERS YOUR LIGHT</span><h2>{levelName} complete.</h2><div className="results-grid"><span><Trophy /> Score<strong>{result.score.toLocaleString()}</strong></span><span><Clock3 /> Time<strong>{formatTime(result.elapsedMs)}</strong></span><span><Sparkles /> Star Shards<strong>{result.shards} / {result.totalShards}</strong></span><span><Diamond /> Crystal Gems<strong>{result.gems} / {result.totalGems}</strong></span><span><Heart /> Hearts<strong>{result.hearts} / {combat.maxHearts}</strong></span><span><Zap /> Creatures<strong>{result.enemiesDefeated} / {result.totalEnemies}</strong></span></div><p className="best-score">Best score: {result.bestScore.toLocaleString()}{result.newBest ? ' · New best!' : ''}</p>{saveError && <p role="alert">This result could not be saved by your browser.</p>}<div className="result-actions"><button autoFocus className="primary-button" onClick={restart}><RotateCcw size={16} /> Replay trail</button><Link className="secondary-button" to="/worlds">World map</Link><button className="text-link" onClick={continueExploring}><Play size={14} /> Keep exploring</button></div></div>}
      {gameOver && active && <div className="practice-paused game-over-panel" role="region" aria-label="Game over"><span className="eyebrow">THE LIGHT CAN FIND ITS WAY AGAIN</span><h2>Game Over</h2><p>Score {run.score.toLocaleString()} <span>/</span> {objects.gems} Crystal Gems</p><button autoFocus className="primary-button" onClick={restart}><RotateCcw size={16} /> Retry level</button><Link className="secondary-button" to="/worlds">World map</Link><Link className="text-link" to="/">Main menu</Link></div>}
    </>}
  </div>;
}
function formatTime(ms: number) { const seconds = Math.floor(ms / 1000); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; }
function TouchButton({ action, label, bridge, children }: { action: MoveAction; label: string; bridge: GameBridge; children: React.ReactNode }) {
  const pointers = useRef(new Set<number>());
  function down(event: PointerEvent<HTMLButtonElement>) {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.add(event.pointerId); bridge.send({ type: 'input', action, pressed: true });
  }
  function up(event: PointerEvent<HTMLButtonElement>) {
    pointers.current.delete(event.pointerId);
    if (!pointers.current.size) bridge.send({ type: 'input', action, pressed: false });
  }
  return <button aria-label={label} onPointerDown={down} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onContextMenu={event => event.preventDefault()}>{children}</button>;
}
