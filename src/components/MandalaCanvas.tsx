import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MandalaSettings, Point, DrawingTool } from '../types';

interface MandalaCanvasProps {
  settings: MandalaSettings;
  onClear: (clearFn: () => void) => void;
}

const MandalaCanvas: React.FC<MandalaCanvasProps> = ({ settings, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    onClear(clear);
  }, [onClear, clear]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current || !previewCanvasRef.current || !guideCanvasRef.current) return;
      
      const canvasContainer = canvasRef.current.parentElement;
      if (!canvasContainer) return;
      
      // Use clientWidth/Height for 1:1 pixel mapping with integer values
      const width = canvasContainer.clientWidth;
      const height = canvasContainer.clientHeight;
      const canvases = [canvasRef.current, previewCanvasRef.current, guideCanvasRef.current];
      
      // Save current content from main canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvasRef.current.width > 0) {
        tempCtx.drawImage(canvasRef.current, 0, 0);
      }

      canvases.forEach(c => {
        if (!c) return;
        c.width = width;
        c.height = height;
        // Ensure style matches perfectly
        c.style.width = `${width}px`;
        c.style.height = `${height}px`;
      });
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (tempCanvas.width > 0) {
          ctx.drawImage(tempCanvas, 0, 0, width, height);
        }
      }

      // Redraw guide lines immediately on size change
      const gCtx = guideCanvasRef.current.getContext('2d');
      if (gCtx) {
        drawGuideLines(gCtx, width, height);
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update guide lines
  useEffect(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGuideLines(ctx, canvas.width, canvas.height);
  }, [settings.count]);

  const getSymmetricPoints = (p: Point, center: Point): Point[] => {
    const dx = p.x - center.x;
    const dy = p.y - center.y;
    const points: Point[] = [];
    const n = settings.count;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    for (let i = 0; i < n; i++) {
      const theta = angle + (i * 2 * Math.PI) / n;
      points.push({
        x: center.x + dist * Math.cos(theta),
        y: center.y + dist * Math.sin(theta),
      });
    }
    return points;
  };

  const drawShape = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, center: Point) => {
    const n = settings.count;
    
    // Points relative to center
    const r1 = { x: p1.x - center.x, y: p1.y - center.y };
    const r2 = { x: p2.x - center.x, y: p2.y - center.y };

    ctx.strokeStyle = settings.brushColor;
    ctx.lineWidth = settings.brushSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    for (let i = 0; i < n; i++) {
      const angle = (i * 2 * Math.PI) / n;
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);

      ctx.beginPath();
      switch (settings.tool) {
        case 'brush':
        case 'line':
          ctx.moveTo(r1.x, r1.y);
          ctx.lineTo(r2.x, r2.y);
          break;
        case 'rect':
          ctx.strokeRect(r1.x, r1.y, r2.x - r1.x, r2.y - r1.y);
          break;
        case 'circle':
          const radius = Math.sqrt((r2.x - r1.x) ** 2 + (r2.y - r1.y) ** 2);
          ctx.arc(r1.x, r1.y, radius, 0, Math.PI * 2);
          break;
        case 'ellipse':
          ctx.ellipse(r1.x, r1.y, Math.abs(r2.x - r1.x), Math.abs(r2.y - r1.y), 0, 0, Math.PI * 2);
          break;
        case 'star':
          drawStar(ctx, r1.x, r1.y, 5, Math.sqrt((r2.x - r1.x)**2 + (r2.y - r1.y)**2), Math.sqrt((r2.x - r1.x)**2 + (r2.y - r1.y)**2)/2);
          break;
        case 'moon':
          drawMoon(ctx, r1.x, r1.y, Math.sqrt((r2.x - r1.x)**2 + (r2.y - r1.y)**2));
          break;
        case 'leaf':
          drawLeaf(ctx, r1.x, r1.y, r2.x - r1.x, r2.y - r1.y);
          break;
        case 'curve':
          ctx.quadraticCurveTo(r1.x + (r2.x - r1.x), r1.y, r2.x, r2.y);
          break;
      }
      ctx.stroke();
      ctx.restore();
    }
  };

  const drawStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawMoon = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.quadraticCurveTo(x + radius * 0.5, y, x + radius * Math.cos(0.2 * Math.PI), y + radius * Math.sin(0.2 * Math.PI));
    ctx.closePath();
  };

  const drawLeaf = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y);
    ctx.closePath();
  };

  const drawGuideLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const center = { x: width / 2, y: height / 2 };
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    const n = settings.count;
    for (let i = 0; i < n; i++) {
      const theta = (i * 2 * Math.PI) / n;
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(center.x + width * Math.cos(theta), center.y + height * Math.sin(theta));
      ctx.stroke();
    }
    ctx.restore();
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const mouseEv = e as React.MouseEvent;
      clientX = mouseEv.clientX;
      clientY = mouseEv.clientY;
    }

    // Precise mapping: (clientX - rect.left) gives CSS pixels.
    // Since we set canvas.width = rect.width, this is 1:1 if rounding is handled.
    const p = { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };
    startPoint.current = p;
    lastPoint.current = p;
    setIsDrawing(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const mouseEv = e as React.MouseEvent;
      clientX = mouseEv.clientX;
      clientY = mouseEv.clientY;
    }

    const currentPoint = { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };
    const previewCanvas = previewCanvasRef.current!;
    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    if (settings.tool === 'brush') {
      const ctx = canvas.getContext('2d')!;
      drawShape(ctx, lastPoint.current!, currentPoint, center);
      lastPoint.current = currentPoint;
    } else {
      const pCtx = previewCanvas.getContext('2d')!;
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      drawShape(pCtx, startPoint.current, currentPoint, center);
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint.current) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      let clientX, clientY;
      if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        const mouseEv = e as React.MouseEvent;
        clientX = mouseEv.clientX;
        clientY = mouseEv.clientY;
      }

      const endPoint = { x: clientX - rect.left, y: clientY - rect.top };
      const canvas = canvasRef.current!;
      const previewCanvas = previewCanvasRef.current!;
      const center = { x: canvas.width / 2, y: canvas.height / 2 };

      if (settings.tool !== 'brush') {
        const ctx = canvas.getContext('2d')!;
        drawShape(ctx, startPoint.current, endPoint, center);
      }
      
      const pCtx = previewCanvas.getContext('2d')!;
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    setIsDrawing(false);
    startPoint.current = null;
    lastPoint.current = null;
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden cursor-crosshair">
      <div className="relative aspect-square h-full max-h-full rounded-full bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden touch-none">
        {/* Guide Lines Canvas */}
        <canvas
          ref={guideCanvasRef}
          className="absolute inset-0 pointer-events-none opacity-50"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Main Drawing Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Preview Canvas */}
        <canvas
          ref={previewCanvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 block"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
};

export default MandalaCanvas;
// End of file
