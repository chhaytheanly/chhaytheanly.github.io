import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '../../hooks/useMusic';
import { useAudio } from '../../hooks/useAudio';

/**
 * THEME PLAYER
 *
 * Plays whatever `siteContent.music.tracks` lists — swap that array for the
 * Persona 3 Reload soundtrack and this control drives it unchanged.
 */
export function MusicControls() {
  const { title, playing, toggle, next, prev, volume, setVolume, playlist } = useMusic();
  const { play } = useAudio();

  const nudge = (fn: () => void) => {
    play('click_light');
    fn();
  };

  return (
    <div className="flex items-center gap-2 border-2 border-electric-cyan/40 px-2 py-1">
      <button
        onClick={() => nudge(toggle)}
        aria-label={playing ? 'Pause theme' : 'Play theme'}
        title={playing ? 'PAUSE (M)' : 'PLAY (M)'}
        className="text-electric-cyan transition-colors duration-150 hover:text-alert-yellow"
      >
        {playing ? <Pause size={14} strokeWidth={2.5} /> : <Play size={14} strokeWidth={2.5} />}
      </button>

      {playlist.length > 1 && (
        <>
          <button
            onClick={() => nudge(prev)}
            aria-label="Previous track"
            className="text-stark-white/60 transition-colors duration-150 hover:text-electric-cyan"
          >
            <SkipBack size={13} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => nudge(next)}
            aria-label="Next track"
            className="text-stark-white/60 transition-colors duration-150 hover:text-electric-cyan"
          >
            <SkipForward size={13} strokeWidth={2.5} />
          </button>
        </>
      )}

      <span className="hidden max-w-[9rem] truncate font-mono text-[10px] tracking-[0.15em] text-stark-white/70 lg:inline">
        {title}
      </span>

      <span className="hidden items-center gap-1 xl:flex">
        {volume === 0 ? <VolumeX size={12} className="text-stark-white/40" /> : <Volume2 size={12} className="text-stark-white/50" />}
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label="Theme volume"
          className="h-1 w-16 cursor-pointer appearance-none bg-dark-hour accent-electric-cyan"
          style={{ accentColor: '#00E5FF' }}
        />
      </span>
    </div>
  );
}

export default MusicControls;
