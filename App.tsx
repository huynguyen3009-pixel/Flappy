import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bird } from './components/Bird';
import { Pipe } from './components/Pipe';
import { getGameCommentary } from './services/geminiService';
import { GameState, PipeData } from './types';
import {
  GRAVITY,
  JUMP_STRENGTH,
  PIPE_SPEED,
  PIPE_WIDTH,
  BIRD_SIZE,
  GAP_SIZE,
  BIRD_X_POSITION,
  PIPE_SPAWN_X,
  GROUND_HEIGHT
} from './constants';

// Using a fixed height for logic to ensure consistent gameplay across responsive screens, scaled via CSS
const GAME_HEIGHT = 600;
const GAME_WIDTH = 400;

export default function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [aiCommentary, setAiCommentary] = useState<string>("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Refs for mutable state inside the game loop to avoid closure staleness
  const birdYRef = useRef(GAME_HEIGHT / 2);
  const pipesRef = useRef<PipeData[]>([]);
  const scoreRef = useRef(0);
  const birdVelocityRef = useRef(0);
  const frameRef = useRef<number>(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const spawnPipe = useCallback(() => {
    const minPipeHeight = 50;
    const maxPipeHeight = GAME_HEIGHT - GAP_SIZE - minPipeHeight - GROUND_HEIGHT;
    const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;

    const newPipe: PipeData = {
      id: Date.now(),
      x: GAME_WIDTH, // Start at right edge of logical width
      topHeight: randomHeight,
      passed: false,
    };

    pipesRef.current = [...pipesRef.current, newPipe];
  }, []);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    setAiCommentary("");
    scoreRef.current = 0;
    birdYRef.current = GAME_HEIGHT / 2;
    birdVelocityRef.current = 0;
    pipesRef.current = [];
    spawnPipe();
  };

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      birdVelocityRef.current = JUMP_STRENGTH;
    } else if (gameState === GameState.START || gameState === GameState.GAME_OVER) {
      if (!isLoadingAi) { // Prevent restarting while AI is thinking (optional UX choice)
         startGame();
      }
    }
  }, [gameState, isLoadingAi]);

  const handleGameOver = useCallback(async () => {
    setGameState(GameState.GAME_OVER);
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
    }
    
    // Gemini Integration
    setIsLoadingAi(true);
    const comment = await getGameCommentary(scoreRef.current);
    setAiCommentary(comment);
    setIsLoadingAi(false);
  }, [highScore]);

  // Game Loop
  useEffect(() => {
    if (gameState !== GameState.PLAYING) {
      cancelAnimationFrame(frameRef.current);
      return;
    }

    let lastPipeSpawnAt = Date.now();

    const loop = () => {
      // 1. Update Physics
      birdVelocityRef.current += GRAVITY;
      birdYRef.current += birdVelocityRef.current;

      // Rotation logic based on velocity
      const rotation = Math.min(Math.max(birdVelocityRef.current * 3, -25), 90);
      setBirdRotation(rotation);

      // 2. Update Pipes
      // Move pipes
      pipesRef.current = pipesRef.current
        .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
        .filter(pipe => pipe.x + PIPE_WIDTH > -50); // Remove if off-screen

      // Spawn new pipes
      if (pipesRef.current.length > 0) {
        const lastPipe = pipesRef.current[pipesRef.current.length - 1];
        // Spawn logic based on distance from last pipe
        if (GAME_WIDTH - lastPipe.x > 220) { 
           spawnPipe();
        }
      } else {
          // Fallback if empty (shouldn't happen often due to initial spawn)
          spawnPipe();
      }

      // 3. Collision Detection
      const birdTop = birdYRef.current;
      const birdBottom = birdYRef.current + BIRD_SIZE;
      const birdLeft = BIRD_X_POSITION;
      const birdRight = BIRD_X_POSITION + BIRD_SIZE;

      // Floor/Ceiling collision
      if (birdBottom >= GAME_HEIGHT - GROUND_HEIGHT || birdTop <= 0) {
        handleGameOver();
        return; 
      }

      // Pipe collision
      let collision = false;
      pipesRef.current.forEach(pipe => {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;

        // Check if bird is within pipe's horizontal area
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          // Check vertical collision (hit top pipe OR hit bottom pipe)
          if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + GAP_SIZE) {
            collision = true;
          }
        }

        // Score update
        if (!pipe.passed && birdLeft > pipeRight) {
          pipe.passed = true;
          scoreRef.current += 1;
          setScore(scoreRef.current);
        }
      });

      if (collision) {
        handleGameOver();
        return;
      }

      // Sync refs to state for render
      setBirdY(birdYRef.current);
      setPipes([...pipesRef.current]);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameRef.current);
  }, [gameState, spawnPipe, handleGameOver]);


  // Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault(); // prevent scrolling
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    // Mouse/Touch is handled by the onMouseDown/onTouchStart on the container
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);


  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
      
      <div className="relative w-full max-w-md aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ring-8 ring-slate-800">
        
        {/* Game Canvas */}
        <div 
            ref={gameContainerRef}
            className="absolute inset-0 bg-sky-300 overflow-hidden cursor-pointer"
            onMouseDown={jump}
            onTouchStart={(e) => {
              // Prevent default to avoid double-firing on some devices or zooming
              // but allow default for standard touch behavior if needed.
              // e.preventDefault(); 
              jump();
            }}
        >
            {/* Background Clouds (Decorative) */}
            <div className="absolute top-20 left-10 text-white opacity-60 text-6xl pointer-events-none">☁️</div>
            <div className="absolute top-40 right-20 text-white opacity-40 text-5xl pointer-events-none">☁️</div>
            
            {/* City/Ground Decoration at bottom */}
            <div 
                className="absolute bottom-0 w-full bg-[#ded895] border-t-4 border-green-800"
                style={{ height: GROUND_HEIGHT, zIndex: 30 }}
            >
                {/* Moving ground pattern effect could go here */}
                 <div className="w-full h-4 bg-green-600/50"></div>
            </div>

            {/* Game Objects */}
            <Bird y={birdY} rotation={birdRotation} />
            
            {pipes.map(pipe => (
              <Pipe key={pipe.id} data={pipe} gameHeight={GAME_HEIGHT} />
            ))}

            {/* Score HUD (Playing) */}
            {gameState === GameState.PLAYING && (
              <div className="absolute top-10 w-full text-center z-40 pointer-events-none">
                <span className="text-6xl font-bold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] stroke-black stroke-2">
                  {score}
                </span>
              </div>
            )}

            {/* Start Screen */}
            {gameState === GameState.START && (
               <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
                  <h1 className="text-6xl text-white font-bold mb-4 text-center drop-shadow-lg">
                    GEMINI<br/><span className="text-yellow-400">FLAPPY</span>
                  </h1>
                  <p className="text-white text-xl animate-pulse">Press Space or Tap to Start</p>
               </div>
            )}

            {/* Game Over Screen */}
            {gameState === GameState.GAME_OVER && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-6 text-center backdrop-blur-md">
                 <div className="bg-[#ded895] border-4 border-orange-500 p-6 rounded-lg w-full max-w-sm shadow-2xl transform transition-all">
                    <h2 className="text-4xl font-bold text-orange-600 mb-4">GAME OVER</h2>
                    
                    <div className="flex justify-between px-4 mb-4">
                      <div className="flex flex-col">
                         <span className="text-orange-800 text-lg">SCORE</span>
                         <span className="text-3xl font-bold text-black">{score}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-orange-800 text-lg">BEST</span>
                         <span className="text-3xl font-bold text-black">{highScore}</span>
                      </div>
                    </div>

                    {/* Gemini AI Section */}
                    <div className="mt-4 bg-white/90 p-3 rounded border-2 border-dashed border-slate-400 min-h-[80px] flex items-center justify-center">
                      {isLoadingAi ? (
                        <div className="flex items-center gap-2 text-slate-500">
                           <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-sm">Gemini is judging you...</span>
                        </div>
                      ) : (
                        <div className="text-left w-full">
                          <span className="text-xs font-bold text-blue-600 block mb-1">GEMINI SAYS:</span>
                          <p className="text-slate-800 italic text-lg leading-tight">"{aiCommentary}"</p>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startGame();
                      }}
                      className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded border-b-4 border-green-700 active:border-b-0 active:mt-[28px] transition-all text-xl"
                    >
                      PLAY AGAIN
                    </button>
                 </div>
              </div>
            )}
        </div>

        {/* Controls Hint (Desktop only mostly) */}
        <div className="absolute bottom-[-40px] w-full text-center text-slate-500 text-sm hidden sm:block">
           Powered by Google Gemini
        </div>
      </div>
    </div>
  );
}