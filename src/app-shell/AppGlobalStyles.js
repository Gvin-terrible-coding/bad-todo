const AppGlobalStyles = () => (
  <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Inter:wght@400;700&family=Oswald&family=Permanent+Marker&family=Playfair+Display&family=Press+Start+2P&family=Roboto+Slab&family=Space+Mono&family=Cinzel+Decorative&family=Comic+Neue&family=Libre+Baskerville&family=Lato&family=Merriweather&family=Raleway&family=Ubuntu&display=swap');
          :root { --primary-color: #4f46e5; --accent-color: #818cf8; --text-color: #ffffff; transition: --primary-color 0.3s, --accent-color 0.3s; }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
          body { background-color: #0f172a; }
          .bg-primary { background-color: var(--primary-color); }
          .text-accent { color: var(--accent-color); }
          .border-accent { border-color: var(--accent-color); }
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-mono { font-family: 'Space Mono', monospace; }
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-cursive { font-family: 'Dancing Script', cursive; }
          .font-handwritten { font-family: 'Permanent Marker', cursive; }
          .font-pixel { font-family: 'Press Start 2P', cursive; }
          .font-comic { font-family: 'Comic Neue', cursive; }
          .font-fantasy { font-family: 'Cinzel Decorative', cursive; }
          .font-slab { font-family: 'Roboto Slab', serif; }
          .font-sans-condensed { font-family: 'Oswald', sans-serif; }
          .font-baskerville { font-family: 'Libre Baskerville', serif; }
          .font-lato { font-family: 'Lato', sans-serif; }
          .font-merriweather { font-family: 'Merriweather', serif; }
          .font-raleway { font-family: 'Raleway', sans-serif; }
          .font-ubuntu { font-family: 'Ubuntu', sans-serif; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #1e293b; }
          ::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 4px; }
          .projectile { position: absolute; transform: translate(-50%, -50%); transition: top 0.3s linear, left 0.3s linear; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: center; }          @keyframes enemy-hit { 0% { filter: brightness(1); } 50% { filter: brightness(3); } 100% { filter: brightness(1); } }
          .enemy-hit-animation { animation: enemy-hit 0.2s ease-in-out; }
          .xp-bar-container { position: fixed; bottom: 2%; left: 0; width: 100%; display: flex; justify-content: center; pointer-events: none; z-index: 9999; opacity: 0; animation: fade-in-bar 0.5s ease-out forwards; }
          @keyframes fade-in-bar { to { opacity: 1; } }
          .xp-bar-wrapper { position: relative; width: 50%; max-width: 600px; height: 20px; }
          .xp-bar-background { width: 100%; height: 16px; background-color: #1e293b; border: 2px solid #0f172a; border-radius: 2px; overflow: hidden; }
          .xp-bar-fill { height: 100%; background-color: #6366f1; transition: width 0.1s linear; }
          .xp-level-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 12px; text-shadow: 1px 1px 2px #000; }
          .xp-orb { position: fixed; border-radius: 50%; background-color: #a7f3d0; box-shadow: 0 0 10px #34d399, 0 0 4px white; opacity: 0; will-change: transform, opacity; transform: translate(-50%, -50%); }
          .xp-orb.satis-low { width: 8px; height: 8px; }
          .xp-orb.satis-medium { width: 12px; height: 12px; }
          .xp-orb.satis-high { width: 16px; height: 16px; }
          @keyframes fly-to-bar-minecraft { 0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { top: 98vh; left: 50vw; transform: translate(-50%, -50%) scale(0); opacity: 0; } }
          
          /* Tower Defense Tower Animation */
          @keyframes tower-attack-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
          .tower-attack { animation: tower-attack-pulse 0.3s ease-out; }

          /* Dungeon Crawler Animations */
          @keyframes entity-hit-flash { 0% { filter: brightness(1); } 50% { filter: brightness(3) drop-shadow(0 0 5px #fff); } 100% { filter: brightness(1); } }
                    .entity-hit { animation: entity-hit-flash 0.2s ease-in-out; }

          @keyframes elite-glow {
            0%, 100% { filter: drop-shadow(0 0 3px #fde047); }
            50% { filter: drop-shadow(0 0 7px #fde047); }
          }
          .elite-enemy-glow {
            animation: elite-glow 2s infinite;
          }
          
          @keyframes particle-burst {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .particle {
            position: absolute;
            background-color: #f59e0b; /* Orange-yellow for impact */
            border-radius: 50%;
            animation-name: particle-burst;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
          }
          @keyframes fade-out-fast {
            0% { opacity: 1; transform: scale(1.1); }
            80% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
          }
          .animate-fade-out-fast {
            animation: fade-out-fast 1.5s ease-in-out forwards;
          }
          @keyframes explosion-effect {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
          }
          .animate-explosion {
            animation: explosion-effect 0.4s ease-out forwards;
          }
                    @keyframes nemesis-glow {
            0%, 100% { box-shadow: 0 0 12px 4px rgba(239, 68, 68, 0.7); }
            50% { box-shadow: 0 0 20px 8px rgba(239, 68, 68, 0.9); }
          }
          .nemesis-aura {
            animation: nemesis-glow 1.5s infinite;
          }
          @keyframes elite-glow {
            0%, 100% { filter: drop-shadow(0 0 4px #facc15); }
            50% { filter: drop-shadow(0 0 10px #facc15); }
          }
          .elite-glow {
            animation: elite-glow 1.5s infinite;
          }
          @keyframes damage-popup {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-30px); opacity: 0; }
          }
          .damage-number {
            animation: damage-popup 1s ease-out forwards;
          }
          @keyframes correct-answer-pop {
            0% { transform: translate(-50%, 0) scale(0.5); opacity: 0; }
            20%, 80% { transform: translate(-50%, -20px) scale(1); opacity: 1; }
            100% { transform: translate(-50%, -40px) scale(0.5); opacity: 0; }
          }
          .correct-answer-popup {
            animation: correct-answer-pop 2s ease-out forwards;
          }
      `}</style>
);

export default AppGlobalStyles;
