import { Gamepad2, Users } from 'lucide-react';

interface HomePageProps {
  onSelectMode: (mode: 'ai' | '2player') => void;
}

export function HomePage({ onSelectMode }: HomePageProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      {/* Background grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Logo & Title */}
        <div className="mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">
            Cờ Caro
          </h1>
          <p className="text-xl text-gray-500">
            5 ô liên tiếp để chiến thắng
          </p>
        </div>

        {/* Mode Selection Buttons */}
        <div className="flex flex-col gap-6 items-center">
          <button
            onClick={() => onSelectMode('ai')}
            className="group relative w-80 h-24 bg-white border-2 border-gray-900 
                     hover:bg-gray-900 transition-all duration-300 
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <div className="flex items-center justify-center gap-4">
              <Gamepad2 className="w-8 h-8 text-gray-900 group-hover:text-white transition-colors" />
              <span className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors">
                Chơi với máy
              </span>
            </div>
          </button>

          <button
            onClick={() => onSelectMode('2player')}
            className="group relative w-80 h-24 bg-white border-2 border-gray-900 
                     hover:bg-gray-900 transition-all duration-300 
                     shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                     hover:translate-x-[2px] hover:translate-y-[2px]
                     active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            <div className="flex items-center justify-center gap-4">
              <Users className="w-8 h-8 text-gray-900 group-hover:text-white transition-colors" />
              <span className="text-2xl font-bold text-gray-900 group-hover:text-white transition-colors">
                Chơi với bạn
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
