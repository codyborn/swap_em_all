'use client';

import { ReactNode } from 'react';

interface GameBoyShellProps {
  children: ReactNode;
}

export function GameBoyShell({ children }: GameBoyShellProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      {/* GameBoy Shell */}
      <div className="relative bg-gray-200 rounded-3xl p-8 shadow-2xl" style={{ width: '640px' }}>
        {/* Screen Area */}
        <div className="bg-gray-700 rounded-2xl p-6 mb-8">
          <div className="bg-[#9bbc0f] rounded-lg p-2 aspect-[10/9] relative overflow-hidden border-4 border-gray-800">
            {/* GameBoy Screen */}
            <div className="w-full h-full bg-[#9bbc0f]">
              {children}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 text-center font-sans">
            UNI ARCADE
          </div>
        </div>

        {/* D-Pad and Buttons */}
        <div className="flex justify-between items-center px-4">
          {/* D-Pad */}
          <div className="relative w-32 h-32">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800 rounded"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-800 rounded"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800 rounded"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800 rounded"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800"></div>
          </div>

          {/* Action Buttons */}
          <div className="relative w-32 h-24">
            <div className="absolute bottom-4 right-12">
              <div className="w-12 h-12 bg-red-600 rounded-full shadow-lg border-2 border-red-700">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  B
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0">
              <div className="w-12 h-12 bg-red-600 rounded-full shadow-lg border-2 border-red-700">
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                  A
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start/Select Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-16 h-6 bg-gray-600 rounded-full shadow-inner flex items-center justify-center">
            <span className="text-xs font-sans text-gray-300">SELECT</span>
          </div>
          <div className="w-16 h-6 bg-gray-600 rounded-full shadow-inner flex items-center justify-center">
            <span className="text-xs font-sans text-gray-300">START</span>
          </div>
        </div>

        {/* Speaker */}
        <div className="absolute top-4 right-2 grid grid-cols-2 gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-400 rounded-full"></div>
          ))}
        </div>

        {/* Power LED */}
        <div className="absolute top-2 left-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/50"></div>
          <span className="text-xs font-sans text-gray-600">POWER</span>
        </div>
      </div>
    </div>
  );
}
