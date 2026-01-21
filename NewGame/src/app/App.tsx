import { useState } from 'react';
import { HomePage } from '@/app/components/HomePage';
import { GameBoard } from '@/app/components/GameBoard';

type GameMode = 'ai' | '2player' | null;

export default function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);

  const handleSelectMode = (mode: 'ai' | '2player') => {
    setGameMode(mode);
  };

  const handleBackToHome = () => {
    setGameMode(null);
  };

  return (
    <div className="w-full min-h-screen">
      {gameMode === null ? (
        <HomePage onSelectMode={handleSelectMode} />
      ) : (
        <GameBoard mode={gameMode} onBackToHome={handleBackToHome} />
      )}
    </div>
  );
}
