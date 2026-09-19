import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Pause, Play, RotateCcw, Zap } from 'lucide-react';
import { GameBridge } from '../game/bridge';
import type { MoveAction } from '../game/entities/player/PlayerInput';
import type { Game } from 'phaser';

export function GameCanvas({ reducedMotion, active = true, course = '1-1' }: { reducedMotion: boolean; active?: boolean; course?: '1-1' | 'practice' }) {
  const host = useRef<HTMLDivElement>(null);
  const [bridge] = useState(() => new GameBridge());
  const [touchDevice] = useState(() => navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);
  const isActive = useRef(active);
  const motionPreference = useRef(reducedMotion);
  isActive.current = active;
  motionPreference.current = reducedMotion;
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [error, setError] = useState('');
  const [region, setRegion] = useState('');
  const [levelName, setLevelName] = useState('The Verdant Trail');
  const [levelId, setLevelId] = useState<string>(course);
  const practice = levelId === 'practice';
  const focusCanvas = () => host.current?.querySelector('canvas')?.focus({ preventScroll: true });
  useEffect(() => { bridge.send({ type: 'suspend', suspended: !active }); }, [active, bridge]);
  useEffect(() => { bridge.send({ type: 'preferences', reducedMotion }); }, [reducedMotion, bridge]);
  useEffect(() => {
    let disposed = false;
    let game: Game | undefined;
    let resizeObserver: ResizeObserver | undefined;
    setReady(false); setProgress(0); setError(''); setPaused(false);
    const unsubscribe = bridge.subscribe(event => {
      if (event.type === 'loading') setProgress(Math.round(event.progress * 100));
      if (event.type === 'ready') {
        setReady(true); bridge.send({ type: 'suspend', suspended: !isActive.current });
        bridge.send({ type: 'preferences', reducedMotion: motionPreference.current });
        if (isActive.current) focusCanvas();
      }
      if (event.type === 'paused') setPaused(event.paused);
      if (event.type === 'error') setError(event.message);
      if (event.type === 'level') { setLevelName(event.name); setLevelId(event.id); }
      if (event.type === 'region') setRegion(event.name);
    });
    import('../game/createGame').then(({ createGame }) => {
      if (!disposed && host.current) {
        game = createGame(host.current, bridge, motionPreference.current, course);
        // Container changes (rotation/fullscreen) are not always window resize events.
        resizeObserver = new ResizeObserver(() => { game?.scale.refresh(); });
        resizeObserver.observe(host.current);
      }
    }).catch(() => { if (!disposed) setError('The game engine could not start. Refresh to try again.'); });
    return () => { disposed = true; unsubscribe(); resizeObserver?.disconnect(); game?.destroy(true); };
  }, [bridge, course]);
  function resume() { bridge.send({ type: 'resume' }); focusCanvas(); }
  function restart() { bridge.send({ type: 'restart' }); focusCanvas(); }
  return <div className={`game-frame${touchDevice ? ' has-touch' : ''}`}><div ref={host} className="canvas-host" />
    {!ready && <div className="loading" role="status"><span className="eyebrow">SKYBOUND ADVENTURE</span><h2>A world is waking up.</h2><progress value={progress} max={100} /><p>Loading {progress}%</p><small>Hold your jump to reach a little higher.</small></div>}
    {error && <p className="engine-error" role="alert">{error}</p>}
    {ready && <>
      <div className="practice-toolbar"><span><span className="live-dot" /> EMERALD VALLEY <small>{practice ? 'Movement practice / Stage 2' : `1-1 / ${levelName}`}</small></span><div><button className="icon-button" onClick={restart} aria-label={practice ? 'Restart practice' : 'Restart trail'}><RotateCcw size={17} /></button><button className="icon-button" onClick={() => bridge.send({ type: 'pause' })} aria-label={practice ? 'Pause practice' : 'Pause trail'}><Pause size={17} /></button></div></div>
      {!practice && <div className="region-label">{region}<small>TERRAIN PREVIEW / STAGE 3</small></div>}
      <div className="movement-hint"><kbd>A</kbd><kbd>D</kbd> move <span>/</span><kbd>Space</kbd> jump <span>/</span><kbd>Shift</kbd> sprint <span>/</span> click scene to focus</div>
      <div className="touch-controls" aria-label="Touch movement controls"><div><TouchButton action="left" label="Move left" bridge={bridge}><ArrowLeft /></TouchButton><TouchButton action="right" label="Move right" bridge={bridge}><ArrowRight /></TouchButton></div><div><TouchButton action="sprint" label="Sprint" bridge={bridge}><Zap /></TouchButton><TouchButton action="jump" label="Jump" bridge={bridge}><ArrowUp /></TouchButton></div></div>
      {paused && active && <div className="practice-paused" role="region" aria-label="Game paused" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); resume(); } }}><span className="eyebrow">TAKE A BREATHER</span><h2>A moment in the meadow.</h2><p>Your adventure will wait.</p><button autoFocus className="primary-button" onClick={resume}><Play size={16} /> {practice ? 'Resume practice' : 'Resume trail'}</button><button className="text-link" onClick={restart}><RotateCcw size={14} /> Start again</button></div>}
    </>}
  </div>;
}
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
