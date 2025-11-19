import React from 'react';
import { PipeData } from '../types';
import { PIPE_WIDTH, GAP_SIZE } from '../constants';

interface PipeProps {
  data: PipeData;
  gameHeight: number;
}

export const Pipe: React.FC<PipeProps> = ({ data, gameHeight }) => {
  const { x, topHeight } = data;
  const bottomHeight = gameHeight - topHeight - GAP_SIZE;

  return (
    <>
      {/* Top Pipe */}
      <div
        className="absolute z-10 bg-green-500 border-x-4 border-b-4 border-black"
        style={{
          left: x,
          top: 0,
          width: PIPE_WIDTH,
          height: topHeight,
        }}
      >
        {/* Pipe Cap */}
        <div className="absolute bottom-0 left-[-6px] w-[calc(100%+12px)] h-8 bg-green-500 border-4 border-black" />
        {/* Highlight */}
        <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-30" />
      </div>

      {/* Bottom Pipe */}
      <div
        className="absolute z-10 bg-green-500 border-x-4 border-t-4 border-black"
        style={{
          left: x,
          top: topHeight + GAP_SIZE,
          width: PIPE_WIDTH,
          height: bottomHeight,
        }}
      >
        {/* Pipe Cap */}
        <div className="absolute top-0 left-[-6px] w-[calc(100%+12px)] h-8 bg-green-500 border-4 border-black" />
        {/* Highlight */}
        <div className="absolute top-0 left-2 w-2 h-full bg-green-300 opacity-30" />
      </div>
    </>
  );
};