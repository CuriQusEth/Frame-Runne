import { useEffect, useRef, useState } from 'react';

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const BASE_SPEED = 5;
const MAX_SPEED = 15;
const GROUND_HEIGHT = 100;
const PERFECT_THRESHOLD = 60; // Pixels distance to consider 'perfect' frame dodge

interface Player {
  y: number;
  vy: number;
  state: 'run' | 'jump' | 'slide';
  width: number;
  height: number;
  slideTicks: number;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'high' | 'low';
  passed: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export function useGameEngine(onCrash: (score: number, distance: number, combo: number) => void) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [distance, setDistance] = useState(0);

  const playerRef = useRef<Player>({ y: 0, vy: 0, state: 'run', width: 40, height: 80, slideTicks: 0 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const speedRef = useRef(BASE_SPEED);
  
  const width = window.innerWidth;
  const height = window.innerHeight;

  const initGame = () => {
    playerRef.current = { y: height - GROUND_HEIGHT - 80, vy: 0, state: 'run', width: 40, height: 80, slideTicks: 0 };
    obstaclesRef.current = [];
    particlesRef.current = [];
    speedRef.current = BASE_SPEED;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setDistance(0);
  };

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
        particlesRef.current.push({
            x,
            y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: Math.random() * 30 + 10,
            maxLife: 40,
            color
        });
    }
  }

  const handleInput = (action: 'jump' | 'slide') => {
    const p = playerRef.current;
    
    // Check for 'Perfect Frame'
    let isPerfect = false;
    let closestObs = obstaclesRef.current.find(o => !o.passed && o.x > 50 && o.x < 150);
    
    if (closestObs) {
      const dist = closestObs.x - (50 + p.width);
      if (dist < PERFECT_THRESHOLD && dist > 0) {
        if ((action === 'jump' && closestObs.type === 'low') || 
            (action === 'slide' && closestObs.type === 'high')) {
            isPerfect = true;
        }
      }
    }

    if (action === 'jump' && p.state !== 'jump') {
      p.vy = JUMP_FORCE;
      p.state = 'jump';
      p.height = 80;
    } else if (action === 'slide' && p.state !== 'slide') {
      p.state = 'slide';
      p.height = 40;
      p.y = height - GROUND_HEIGHT - 40;
      p.slideTicks = 40;
    }

    if (isPerfect) {
      setCombo(c => {
          const newC = c + 1;
          setMaxCombo(mc => Math.max(mc, newC));
          return newC;
      });
      setScore(s => s + 50 * (combo + 1));
      spawnParticles(p.width + 50, p.y + p.height/2, '#00f3ff', 20); // Cyan burst
    }
  };

  const update = () => {
    const p = playerRef.current;
    
    // Physics
    if (p.state === 'jump') {
      p.y += p.vy;
      p.vy += GRAVITY;
      if (p.y >= height - GROUND_HEIGHT - 80) {
        p.y = height - GROUND_HEIGHT - 80;
        p.state = 'run';
        p.vy = 0;
      }
    } else if (p.state === 'slide') {
      p.slideTicks--;
      if (p.slideTicks <= 0) {
        p.state = 'run';
        p.height = 80;
        p.y = height - GROUND_HEIGHT - 80;
      }
    }
    
    // Distance & Speed
    speedRef.current = Math.min(MAX_SPEED, BASE_SPEED + distance / 1000);
    setDistance(d => d + speedRef.current / 10);
    setScore(s => s + Math.floor(speedRef.current / 5));

    // Obstacles
    if (Math.random() < 0.015 + (speedRef.current * 0.001)) {
        if (obstaclesRef.current.length === 0 || obstaclesRef.current[obstaclesRef.current.length - 1].x < width - 400) {
            const isHigh = Math.random() > 0.5;
            obstaclesRef.current.push({
                x: width,
                y: isHigh ? height - GROUND_HEIGHT - 90 : height - GROUND_HEIGHT - 40,
                width: 30,
                height: isHigh ? 90 : 40,
                type: isHigh ? 'high' : 'low',
                passed: false
            });
        }
    }

    for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.x -= speedRef.current;

        // Collision
        const pRect = { x: 50, y: p.y, w: p.width, h: p.height };
        const oRect = { x: obs.x, y: obs.y, w: obs.width, h: obs.height };
        
        if (pRect.x < oRect.x + oRect.w &&
            pRect.x + pRect.w > oRect.x &&
            pRect.y < oRect.y + oRect.h &&
            pRect.y + pRect.h > oRect.y) {
            // CRASH!
            onCrash(score, Math.floor(distance), maxCombo);
            return false; // stop loop
        }

        if (!obs.passed && obs.x < 50) {
            obs.passed = true;
            if (combo > 0 && Math.abs(obs.x - 50) > PERFECT_THRESHOLD) {
                // Passed without perfect timing? Keep combo but no big reward, or drop it.
                // For 'frame perfect' focus, if they didn't get perfect, drop combo.
                setCombo(0);
            }
        }

        if (obs.x < -100) obstaclesRef.current.splice(i, 1);
    }

    // Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life--;
        if (pt.life <= 0) particlesRef.current.splice(i, 1);
    }

    return true;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#050505'; // Vibrant Palette BG
    ctx.fillRect(0, 0, width, height);

    // Draw Grid / Ground
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - GROUND_HEIGHT);
    ctx.lineTo(width, height - GROUND_HEIGHT);
    ctx.stroke();

    // Player
    const p = playerRef.current;
    ctx.fillStyle = combo > 5 ? '#00f3ff' : 'transparent';
    ctx.shadowBlur = combo > 5 ? 20 : 0;
    ctx.shadowColor = '#00f3ff';
    if(combo > 5) {
        ctx.fillRect(50, p.y, p.width, p.height);
    }
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, p.y, p.width, p.height);
    ctx.shadowBlur = 0;

    // Obstacles
    obstaclesRef.current.forEach(obs => {
        ctx.fillStyle = '#ff00ff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#ff00ff';
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        
        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });
    ctx.shadowBlur = 0;

    // Particles
    particlesRef.current.forEach(pt => {
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = pt.life / pt.maxLife;
        ctx.fillRect(pt.x, pt.y, 4, 4);
    });
    ctx.globalAlpha = 1;
  };

  const loop = () => {
    if (!update()) return; // crashed
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(loop);
  };

  const startGame = () => {
    initGame();
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    requestRef.current = requestAnimationFrame(loop);
  };

  const stopGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return { canvasRef, startGame, stopGame, handleInput, score, combo, distance: Math.floor(distance) };
}
