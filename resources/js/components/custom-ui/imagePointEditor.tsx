import React, { useState, useRef, useEffect } from 'react';
import { Crosshair, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PointDef {
    id: string;
    label: string;
    x: number | null;
    y: number | null;
    color?: string;
}

interface ImagePointEditorProps {
    imageUrl: string;
    points: PointDef[];
    onChange: (id: string, x: number | null, y: number | null) => void;
    onReset?: () => void;
}

const defaultColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
];

export default function ImagePointEditor({ imageUrl, points, onChange, onReset }: ImagePointEditorProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
    const [activePointId, setActivePointId] = useState<string | null>(null);
    const [draggingPointId, setDraggingPointId] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
        setImageLoaded(true);
    };

    const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!activePointId || !imageLoaded || !imgRef.current || draggingPointId) return;

        const rect = imgRef.current.getBoundingClientRect();
        
        // Calculate click position relative to the image element
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Convert to percentage of displayed image
        const percentX = clickX / rect.width;
        const percentY = clickY / rect.height;

        // Map percentage to natural image dimensions
        const actualX = Math.round(percentX * naturalSize.w);
        const actualY = Math.round(percentY * naturalSize.h);

        // Ensure within bounds
        const boundedX = Math.max(0, Math.min(actualX, naturalSize.w));
        const boundedY = Math.max(0, Math.min(actualY, naturalSize.h));

        onChange(activePointId, boundedX, boundedY);
        
        // Auto-advance to next null point if any
        const currentIndex = points.findIndex(p => p.id === activePointId);
        if (currentIndex !== -1 && currentIndex + 1 < points.length) {
            const nextPoint = points[currentIndex + 1];
            if (nextPoint.x === null || nextPoint.y === null) {
                setActivePointId(nextPoint.id);
                return;
            }
        }
        
        // If we didn't auto-advance to a null point, just deactivate
        setActivePointId(null);
    };

    // Auto-select first point if none selected and it's null
    useEffect(() => {
        if (!activePointId && points.length > 0) {
            const firstNull = points.find(p => p.x === null || p.y === null);
            if (firstNull) {
                setActivePointId(firstNull.id);
            }
        }
    }, [points, activePointId]);

    // Construct polygon points string if all 4 points exist and are set
    const validPoints = points.filter(p => p.x !== null && p.y !== null);
    const shouldDrawPolygon = validPoints.length >= 3;
    const polygonPointsString = shouldDrawPolygon 
        ? validPoints.map(p => `${p.x},${p.y}`).join(' ') 
        : '';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-3">
                {points.map((point, idx) => {
                    const colorClass = point.color || defaultColors[idx % defaultColors.length];
                    const isActive = activePointId === point.id;
                    const isSet = point.x !== null && point.y !== null;

                    return (
                        <Button
                            key={point.id}
                            type="button"
                            variant={isActive ? 'default' : isSet ? 'outline' : 'secondary'}
                            size="sm"
                            onClick={() => setActivePointId(isActive ? null : point.id)}
                            className={cn("flex items-center gap-2 transition-all", isActive && "ring-2 ring-offset-2 ring-primary")}
                        >
                            <span className={cn("w-3 h-3 rounded-full shadow-sm", colorClass)}></span>
                            {point.label}
                            {isSet && <span className="text-xs opacity-70">({point.x}, {point.y})</span>}
                            {isActive && <MousePointer2 className="w-3 h-3 ml-1 animate-pulse" />}
                        </Button>
                    );
                })}
            </div>

            <div 
                className={cn(
                    "relative border rounded-lg overflow-hidden bg-muted flex items-center justify-center select-none group touch-none",
                    activePointId && !draggingPointId ? "cursor-crosshair" : "cursor-default"
                )}
                onClick={handleImageClick}
            >
                {/* The main image */}
                <img 
                    ref={imgRef}
                    src={imageUrl} 
                    alt="Target" 
                    className="w-full h-auto max-h-[75vh] object-contain pointer-events-none select-none"
                    onLoad={handleImageLoad}
                    draggable={false}
                />
                
                {/* Polygon Overlay */}
                {imageLoaded && shouldDrawPolygon && (
                    <svg 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox={`0 0 ${naturalSize.w} ${naturalSize.h}`}
                        preserveAspectRatio="xMidYMid meet"
                    >
                        <polygon 
                            points={polygonPointsString} 
                            className="fill-blue-500/20 stroke-blue-500 stroke-[3px] transition-all duration-75"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}

                {/* Point Markers */}
                {imageLoaded && points.map((point, idx) => {
                    if (point.x === null || point.y === null) return null;
                    
                    const percentX = (point.x / naturalSize.w) * 100;
                    const percentY = (point.y / naturalSize.h) * 100;
                    const colorClass = point.color || defaultColors[idx % defaultColors.length];
                    const isDragging = draggingPointId === point.id;
                    const isActive = activePointId === point.id || isDragging;

                    return (
                        <div 
                            key={point.id}
                            className={cn(
                                "absolute transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md ring-2 ring-white cursor-grab active:cursor-grabbing touch-none select-none",
                                isDragging ? "z-30 scale-125 ring-primary" : isActive ? "z-20 scale-110 ring-primary" : "z-10 hover:scale-110",
                                !isDragging && "transition-all duration-200",
                                colorClass
                            )}
                            style={{ 
                                left: `${percentX}%`, 
                                top: `${percentY}%`,
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%'
                            }}
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                e.currentTarget.setPointerCapture(e.pointerId);
                                setActivePointId(point.id);
                                setDraggingPointId(point.id);
                            }}
                            onPointerMove={(e) => {
                                if (draggingPointId === point.id && imgRef.current) {
                                    e.stopPropagation();
                                    const rect = imgRef.current.getBoundingClientRect();
                                    
                                    // Calculate relative to image bounds
                                    let clickX = e.clientX - rect.left;
                                    let clickY = e.clientY - rect.top;
                                    
                                    // Constrain to image bounds
                                    clickX = Math.max(0, Math.min(clickX, rect.width));
                                    clickY = Math.max(0, Math.min(clickY, rect.height));

                                    const percentX = clickX / rect.width;
                                    const percentY = clickY / rect.height;

                                    const actualX = Math.round(percentX * naturalSize.w);
                                    const actualY = Math.round(percentY * naturalSize.h);

                                    onChange(point.id, actualX, actualY);
                                }
                            }}
                            onPointerUp={(e) => {
                                if (draggingPointId === point.id) {
                                    e.stopPropagation();
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    setDraggingPointId(null);
                                }
                            }}
                            onPointerCancel={(e) => {
                                if (draggingPointId === point.id) {
                                    e.stopPropagation();
                                    e.currentTarget.releasePointerCapture(e.pointerId);
                                    setDraggingPointId(null);
                                }
                            }}
                        >
                            <span className="text-white text-sm font-bold shadow-sm pointer-events-none">{idx + 1}</span>
                        </div>
                    );
                })}

                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <span className="text-sm font-medium animate-pulse">Loading image...</span>
                    </div>
                )}
                
                {/* Active Tooltip */}
                {activePointId && imageLoaded && !draggingPointId && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 pointer-events-none shadow-xl transition-opacity group-hover:opacity-100 opacity-80">
                        <Crosshair className="w-4 h-4 text-blue-400" />
                        {points.find(p => p.id === activePointId)?.x === null 
                            ? `Click anywhere to place ${points.find(p => p.id === activePointId)?.label}`
                            : `Drag to move ${points.find(p => p.id === activePointId)?.label}`
                        }
                    </div>
                )}
            </div>
            
            <p className="text-xs text-muted-foreground flex justify-between px-1">
                <span>{imageLoaded ? `Original Image Resolution: ${naturalSize.w}x${naturalSize.h}px` : 'Loading resolution...'}</span>
                {activePointId && <span>Hold and drag any point to adjust it</span>}
            </p>
        </div>
    );
}
