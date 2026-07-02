import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Sparkles, 
  Download, 
  Trash2, 
  FolderHeart, 
  Grid2X2, 
  Infinity,
  Undo2,
  Redo2,
  RefreshCw
} from 'lucide-react';
import { MandalaSettings, Point, DrawingTool, SavedMandala } from '../types';

interface MandalaCanvasProps {
  settings: MandalaSettings;
  onClear: (clearFn: () => void) => void;
  onUndo: (undoFn: () => void) => void;
  onRedo: (redoFn: () => void) => void;
  onSaveRegister?: (saveFn: () => void) => void;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
  onSaveToGallery?: (name: string, dataUrl: string) => void;
  savedMandalas?: SavedMandala[];
}

const MandalaCanvas: React.FC<MandalaCanvasProps> = ({ 
  settings, 
  onClear, 
  onUndo, 
  onRedo, 
  onSaveRegister,
  onHistoryChange,
  onSaveToGallery,
  savedMandalas = []
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<Point | null>(null);
  const lastPoint = useRef<Point | null>(null);

  // Dynamic canvas size state to guarantee perfect circular board on all devices
  const [canvasSize, setCanvasSize] = useState<number>(400);
  const [canUndoSelf, setCanUndoSelf] = useState(false);
  const [canRedoSelf, setCanRedoSelf] = useState(false);

  // Undo/Redo Stacks
  const historyRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Gallery Save States
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const triggerSaveToGalleryFlow = useCallback(() => {
    let maxNum = 0;
    if (savedMandalas) {
      savedMandalas.forEach(m => {
        const match = m.name.match(/^曼陀罗画-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) {
            maxNum = num;
          }
        }
      });
    }
    setSaveName(`曼陀罗画-${maxNum + 1}`);
    setShowSaveModal(true);
  }, [savedMandalas]);

  useEffect(() => {
    if (onSaveRegister) {
      onSaveRegister(triggerSaveToGalleryFlow);
    }
  }, [onSaveRegister, triggerSaveToGalleryFlow]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    try {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (historyIndexRef.current < historyRef.current.length - 1) {
        historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
      }
      historyRef.current.push(imgData);
      if (historyRef.current.length > 40) {
        historyRef.current.shift();
      }
      historyIndexRef.current = historyRef.current.length - 1;
      
      setCanUndoSelf(historyIndexRef.current > 0);
      setCanRedoSelf(false);

      if (onHistoryChange) {
        onHistoryChange(historyIndexRef.current > 0, false);
      }
    } catch (err) {
      console.error("Failed to capture canvas state:", err);
    }
  }, [onHistoryChange]);

  const restoreState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const state = historyRef.current[historyIndexRef.current];
    if (state) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(state, 0, 0);
    }
    
    setCanUndoSelf(historyIndexRef.current > 0);
    setCanRedoSelf(historyIndexRef.current < historyRef.current.length - 1);

    if (onHistoryChange) {
      onHistoryChange(
        historyIndexRef.current > 0,
        historyIndexRef.current < historyRef.current.length - 1
      );
    }
  }, [onHistoryChange]);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      restoreState();
    }
  }, [restoreState]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      restoreState();
    }
  }, [restoreState]);

  const restart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [saveState]);

  useEffect(() => {
    onClear(restart);
  }, [onClear, restart]);

  useEffect(() => {
    onUndo(undo);
  }, [onUndo, undo]);

  useEffect(() => {
    onRedo(redo);
  }, [onRedo, redo]);

  // Handle canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current || !canvasRef.current || !previewCanvasRef.current || !guideCanvasRef.current || !displayCanvasRef.current) return;
      
      const cWidth = containerRef.current.clientWidth;
      const cHeight = containerRef.current.clientHeight;
      if (cWidth === 0 || cHeight === 0) return;
      
      // Reserve space for top undo/redo/clear and bottom save/export.
      const maxSize = Math.min(cWidth - 24, cHeight - 110);
      const sizeValue = Math.max(160, maxSize);
      setCanvasSize(sizeValue);
      
      const canvases = [canvasRef.current, previewCanvasRef.current, guideCanvasRef.current, displayCanvasRef.current];
      
      // Save current content of raw canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx && canvasRef.current.width > 0) {
        tempCtx.drawImage(canvasRef.current, 0, 0);
      }

      canvases.forEach(c => {
        if (!c) return;
        c.width = sizeValue;
        c.height = sizeValue;
        c.style.width = `${sizeValue}px`;
        c.style.height = `${sizeValue}px`;
      });
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (tempCanvas.width > 0) {
          ctx.drawImage(tempCanvas, 0, 0, sizeValue, sizeValue);
        }
      }

      // Record first snapshot state if empty
      if (historyRef.current.length === 0) {
        saveState();
      }
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [saveState]);

  // Live Composite Render Loop for continuous expansion tunnel animation
  useEffect(() => {
    let animId: number;

    const tick = () => {
      const displayCanvas = displayCanvasRef.current;
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      const guideCanvas = guideCanvasRef.current;

      if (!displayCanvas || !canvas || !previewCanvas || !guideCanvas) {
        animId = requestAnimationFrame(tick);
        return;
      }

      const ctx = displayCanvas.getContext('2d');
      if (!ctx) return;

      const cx = displayCanvas.width / 2;
      const cy = displayCanvas.height / 2;

      ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

      // 1. Render Drawn Mandala Artwork
      if (settings.animation === 'nested-zoom') {
        const speed = settings.animationSpeed || 2;
        const numLayers = settings.animationDensity || 4;
        const maxScale = settings.maxZoomScale || 4.0;
        const minScale = 0.05;

        // Beautiful calm cycle duration
        const loopMs = 15000 / speed;
        const offsetVal = (Date.now() / loopMs) % 1;
        
        // Very slow, soothing rotation
        const rotationAngle = (Date.now() / (loopMs * 4)) % (Math.PI * 2);

        for (let i = 0; i < numLayers; i++) {
          const layerProgress = i + offsetVal;
          const p = layerProgress / numLayers;
          
          // Perfect sine curve that reaches exactly 0 on both ends (p=0 and p=1)
          const alpha = Math.sin(p * Math.PI);
          // High-fidelity exponential scale calculation
          const scale = minScale * Math.pow(maxScale / minScale, p);

          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.translate(cx, cy);
          ctx.rotate(rotationAngle * (i % 2 === 0 ? 1 : -1) * 0.4); // Stagger rotate layers
          ctx.scale(scale, scale);
          ctx.translate(-cx, -cy);
          ctx.drawImage(canvas, 0, 0);
          ctx.restore();
        }
      } else {
        // Static Presentational render
        ctx.drawImage(canvas, 0, 0);
      }

      // 2. Render Live Drag Shape Preview (Always active during mouse events)
      ctx.drawImage(previewCanvas, 0, 0);

      // 3. Render Guided partition radial slices
      const gCtx = guideCanvas.getContext('2d');
      if (gCtx) {
        gCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);
        drawGuideLines(gCtx, guideCanvas.width, guideCanvas.height);
      }
      ctx.drawImage(guideCanvas, 0, 0);

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [settings.animation, settings.count, settings.animationSpeed, settings.animationDensity, settings.maxZoomScale]);

  const drawGuideLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const center = { x: width / 2, y: height / 2 };
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 140, 100, 0.35)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]); // Dashed line for technical look
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

  const drawShape = (ctx: CanvasRenderingContext2D, p1: Point, p2: Point, center: Point) => {
    const n = settings.count;
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

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    const displayCanvas = displayCanvasRef.current;
    if (!displayCanvas) return;
    const rect = displayCanvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      const mouseEv = e as React.MouseEvent;
      clientX = mouseEv.clientX;
      clientY = mouseEv.clientY;
    }

    const p = { 
      x: clientX - rect.left, 
      y: clientY - rect.top 
    };

    startPoint.current = p;
    lastPoint.current = p;
    setIsDrawing(true);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint.current || !lastPoint.current) return;
    const displayCanvas = displayCanvasRef.current;
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!displayCanvas || !canvas || !previewCanvas) return;

    const rect = displayCanvas.getBoundingClientRect();

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
    const center = { x: canvas.width / 2, y: canvas.height / 2 };

    if (settings.tool === 'brush') {
      const ctx = canvas.getContext('2d')!;
      drawShape(ctx, lastPoint.current, currentPoint, center);
      lastPoint.current = currentPoint;
    } else {
      const pCtx = previewCanvas.getContext('2d')!;
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      drawShape(pCtx, startPoint.current, currentPoint, center);
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !startPoint.current) return;
    
    const displayCanvas = displayCanvasRef.current;
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (displayCanvas && canvas && previewCanvas) {
      const rect = displayCanvas.getBoundingClientRect();
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
      const center = { x: canvas.width / 2, y: canvas.height / 2 };

      if (settings.tool !== 'brush') {
        const ctx = canvas.getContext('2d')!;
        drawShape(ctx, startPoint.current, endPoint, center);
      }
      
      const pCtx = previewCanvas.getContext('2d')!;
      pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);

      saveState();
    }

    setIsDrawing(false);
    startPoint.current = null;
    lastPoint.current = null;
  };

  const performSave = () => {
    const rawCanvas = canvasRef.current;
    if (!rawCanvas || !onSaveToGallery) return;
    
    let fallbackNum = 0;
    if (savedMandalas) {
      savedMandalas.forEach(m => {
        const match = m.name.match(/^曼陀罗画-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > fallbackNum) {
            fallbackNum = num;
          }
        }
      });
    }
    const finalName = saveName.trim() || `曼陀罗画-${fallbackNum + 1}`;
    const url = rawCanvas.toDataURL('image/png');
    
    onSaveToGallery(finalName, url);
    setSaveName('');
    setShowSaveModal(false);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 1500);
  };

  const handleDownloadSelf = () => {
    const rawCanvas = canvasRef.current;
    if (rawCanvas) {
      const link = document.createElement('a');
      link.download = `mandala-${Date.now()}.png`;
      const dataUrl = rawCanvas.toDataURL();
      link.href = dataUrl;
      link.click();

      if (onSaveToGallery) {
        const exportName = `导出的曼陀罗 #${Date.now().toString().slice(-4)}`;
        onSaveToGallery(exportName, dataUrl);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex flex-col items-center justify-center p-2 xs:p-4 md:p-6 overflow-hidden select-none">
      
      {/* 1. TOP HEADER SECTION: Undo, Redo, and Clear Layout Area */}
      <div className="flex items-center gap-1.5 sm:gap-3 mb-2 sm:mb-4 z-20 w-full justify-center">
        <button
          onClick={undo}
          disabled={!canUndoSelf}
          type="button"
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            canUndoSelf 
              ? 'bg-stone-850 text-stone-100 border-stone-700 hover:bg-stone-750 cursor-pointer active:scale-95 shadow-sm' 
              : 'opacity-30 bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
          }`}
          title="撤销"
        >
          <Undo2 size={12} />
          <span>撤销</span>
        </button>

        <button
          onClick={redo}
          disabled={!canRedoSelf}
          type="button"
          className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
            canRedoSelf 
              ? 'bg-stone-850 text-stone-100 border-stone-700 hover:bg-stone-750 cursor-pointer active:scale-95 shadow-sm' 
              : 'opacity-30 bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
          }`}
          title="重做"
        >
          <Redo2 size={12} />
          <span>重做</span>
        </button>

        <button
          onClick={restart}
          type="button"
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full transition-all text-xs font-semibold border bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer active:scale-95 shadow-sm"
          title="清空画板"
        >
          <RefreshCw size={11} className="animate-spin-once" />
          <span>清空</span>
        </button>
      </div>

      {/* 2. MIDDLE VIEWPORT SECTION: Guaranteed Perfect Circular Artboard */}
      <div 
        style={{ width: `${canvasSize}px`, height: `${canvasSize}px` }}
        className="relative rounded-full bg-[#FCFAF6] border border-amber-200/30 shadow-md overflow-hidden touch-none cursor-crosshair shrink-0 transition-all duration-300"
      >
        {/* Hidden Master Drawing Storage Canvas */}
        <canvas id="mandala-master-canvas" ref={canvasRef} className="hidden" />

        {/* Hidden Guide Slices Layer */}
        <canvas ref={guideCanvasRef} className="hidden" />

        {/* Hidden Interactive Shape Preview Layer */}
        <canvas ref={previewCanvasRef} className="hidden" />

        {/* Presentational Dynamic Display Canvas (The Composite Renderer) */}
        <canvas
          ref={displayCanvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 block cursor-crosshair"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* 3. BOTTOM ACTIONS SECTION: Save and Export Layout Area */}
      <div className="flex items-center gap-2 sm:gap-4 mt-3 sm:mt-5 z-20 w-full justify-center">
        <button
          onClick={triggerSaveToGalleryFlow}
          type="button"
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 border border-amber-500 text-white rounded-full transition-all font-bold text-xs shadow-md active:scale-95 cursor-pointer"
        >
          <FolderHeart size={13} />
          <span>保存画作</span>
        </button>
        <button
          onClick={handleDownloadSelf}
          type="button"
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full transition-all font-bold text-xs border bg-white hover:bg-stone-50 border-stone-200 text-stone-700 shadow-sm active:scale-95 cursor-pointer"
        >
          <Download size={13} />
          <span>导出图片</span>
        </button>
      </div>

      {/* Save Name Modal Dialog */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 bg-[#3A322D]/25 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white border border-stone-200 rounded-3xl p-6 space-y-4 shadow-lg text-stone-800"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" />
                  保存画作
                </h3>
              </div>

              <input
                type="text"
                autoFocus
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="例如：海风、金色佛晓、宁静林间..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-amber-600"
              />

              <div className="flex gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-semibold text-stone-600"
                >
                  取消
                </button>
                <button
                  onClick={performSave}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-semibold text-xs text-white shadow-sm active:scale-95 border border-amber-500"
                >
                  生成并保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast notifications */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 bg-stone-800 border border-stone-700 text-stone-100 rounded-2xl px-5 py-3 flex items-center gap-2 text-xs font-medium shadow-md z-50 animate-gpu"
          >
            <Check size={14} strokeWidth={2.5} className="text-amber-400" />
            <span>画作已同步到睡前播放器候选背景中。</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default MandalaCanvas;
