import { useHashRoute, routeMeta } from './hooks/useHashRoute';
import { ScreenShakeProvider } from './components/layout/ScreenShakeProvider';
import { Navigation } from './components/layout/Navigation';
import { PageTransition } from './components/layout/PageTransition';
import { DarkHourOverlay } from './components/layout/DarkHourOverlay';
import { Footer } from './components/layout/Footer';
import { GameShell } from './components/layout/GameShell';
import { GameHUD } from './components/layout/GameHUD';
import { MusicProvider } from './components/layout/MusicProvider';
import { Hero } from './components/sections/Hero';
import { Projects } from './components/sections/Projects';
import { About } from './components/sections/About';
import { Contact } from './components/sections/Contact';

/** Route → screen. `routeMeta` stays the single source of truth. */
const SCREENS: Record<string, () => React.JSX.Element> = {
  '/': Hero,
  '/projects': Projects,
  '/about': About,
  '/contact': Contact,
};

export default function App() {
  const raw = useHashRoute('/');
  const route = routeMeta(raw).path;
  const Screen = SCREENS[route] ?? Hero;

  return (
    <MusicProvider>
      <GameShell>
        {/* The Dark Hour sits OUTSIDE the shake layer: a fixed overlay inside a
            transformed ancestor would tear at the viewport edges when kicked. */}
        <DarkHourOverlay />

        <ScreenShakeProvider className="relative flex min-h-screen flex-col bg-midnight">
          <PageTransition route={route}>
            <main className="flex-1 bg-midnight">
              <Screen />
            </main>
          </PageTransition>

          <Footer />
        </ScreenShakeProvider>

        <Navigation route={route} />
        <GameHUD />
      </GameShell>
    </MusicProvider>
  );
}
