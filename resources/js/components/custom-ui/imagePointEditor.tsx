import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Crosshair, MousePointer2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

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

export default function ImagePointEditor({
    imageUrl,
    points,
    onChange,
    onReset,
}: ImagePointEditorProps) {
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
        if (
            !activePointId ||
            !imageLoaded ||
            !imgRef.current ||
            draggingPointId
        )
            return;

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
        const currentIndex = points.findIndex((p) => p.id === activePointId);
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
            const firstNull = points.find((p) => p.x === null || p.y === null);
            if (firstNull) {
                setActivePointId(firstNull.id);
            }
        }
    }, [points, activePointId]);

    // Construct polygon points string if all 4 points exist and are set
    const validPoints = points.filter((p) => p.x !== null && p.y !== null);
    const shouldDrawPolygon = validPoints.length >= 3;
    const polygonPointsString = shouldDrawPolygon
        ? validPoints.map((p) => `${p.x},${p.y}`).join(' ')
        : '';

    return (
        <div className="space-y-4">
            <div className="mb-3 flex flex-wrap gap-2">
                {points.map((point, idx) => {
                    const colorClass =
                        point.color ||
                        defaultColors[idx % defaultColors.length];
                    const isActive = activePointId === point.id;
                    const isSet = point.x !== null && point.y !== null;

                    return (
                        <Button
                            key={point.id}
                            type="button"
                            variant={
                                isActive
                                    ? 'default'
                                    : isSet
                                      ? 'outline'
                                      : 'secondary'
                            }
                            size="sm"
                            onClick={() =>
                                setActivePointId(isActive ? null : point.id)
                            }
                            className={cn(
                                'flex items-center gap-2 transition-all',
                                isActive && 'ring-2 ring-primary ring-offset-2',
                            )}
                        >
                            <span
                                className={cn(
                                    'h-3 w-3 rounded-full shadow-sm',
                                    colorClass,
                                )}
                            ></span>
                            {point.label}
                            {isSet && (
                                <span className="text-xs opacity-70">
                                    ({point.x}, {point.y})
                                </span>
                            )}
                            {isActive && (
                                <MousePointer2 className="ml-1 h-3 w-3 animate-pulse" />
                            )}
                        </Button>
                    );
                })}
            </div>

            <div
                className={cn(
                    'group relative flex touch-none items-center justify-center overflow-hidden rounded-lg border bg-muted select-none',
                    activePointId && !draggingPointId
                        ? 'cursor-crosshair'
                        : 'cursor-default',
                )}
                onClick={handleImageClick}
            >
                {/* The main image */}
                <img
                    ref={imgRef}
                    src={imageUrl}
                    alt="Target"
                    className="pointer-events-none h-auto max-h-[75vh] w-full object-contain select-none"
                    onLoad={handleImageLoad}
                    draggable={false}
                />

                {/* Polygon Overlay */}
                {imageLoaded && shouldDrawPolygon && (
                    <svg
                        className="pointer-events-none absolute inset-0 h-full w-full"
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
                {imageLoaded &&
                    points.map((point, idx) => {
                        if (point.x === null || point.y === null) return null;

                        const percentX = (point.x / naturalSize.w) * 100;
                        const percentY = (point.y / naturalSize.h) * 100;
                        const colorClass =
                            point.color ||
                            defaultColors[idx % defaultColors.length];
                        const isDragging = draggingPointId === point.id;
                        const isActive =
                            activePointId === point.id || isDragging;

                        return (
                            <div
                                key={point.id}
                                className={cn(
                                    'absolute flex -translate-x-1/2 -translate-y-1/2 transform cursor-grab touch-none items-center justify-center shadow-md ring-2 ring-white select-none active:cursor-grabbing',
                                    isDragging
                                        ? 'z-30 scale-125 ring-primary'
                                        : isActive
                                          ? 'z-20 scale-110 ring-primary'
                                          : 'z-10 hover:scale-110',
                                    !isDragging &&
                                        'transition-all duration-200',
                                    colorClass,
                                )}
                                style={{
                                    left: `${percentX}%`,
                                    top: `${percentY}%`,
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                }}
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.currentTarget.setPointerCapture(
                                        e.pointerId,
                                    );
                                    setActivePointId(point.id);
                                    setDraggingPointId(point.id);
                                }}
                                onPointerMove={(e) => {
                                    if (
                                        draggingPointId === point.id &&
                                        imgRef.current
                                    ) {
                                        e.stopPropagation();
                                        const rect =
                                            imgRef.current.getBoundingClientRect();

                                        // Calculate relative to image bounds
                                        let clickX = e.clientX - rect.left;
                                        let clickY = e.clientY - rect.top;

                                        // Constrain to image bounds
                                        clickX = Math.max(
                                            0,
                                            Math.min(clickX, rect.width),
                                        );
                                        clickY = Math.max(
                                            0,
                                            Math.min(clickY, rect.height),
                                        );

                                        const percentX = clickX / rect.width;
                                        const percentY = clickY / rect.height;

                                        const actualX = Math.round(
                                            percentX * naturalSize.w,
                                        );
                                        const actualY = Math.round(
                                            percentY * naturalSize.h,
                                        );

                                        onChange(point.id, actualX, actualY);
                                    }
                                }}
                                onPointerUp={(e) => {
                                    if (draggingPointId === point.id) {
                                        e.stopPropagation();
                                        e.currentTarget.releasePointerCapture(
                                            e.pointerId,
                                        );
                                        setDraggingPointId(null);
                                    }
                                }}
                                onPointerCancel={(e) => {
                                    if (draggingPointId === point.id) {
                                        e.stopPropagation();
                                        e.currentTarget.releasePointerCapture(
                                            e.pointerId,
                                        );
                                        setDraggingPointId(null);
                                    }
                                }}
                            >
                                <span className="pointer-events-none text-sm font-bold text-white shadow-sm">
                                    {idx + 1}
                                </span>
                            </div>
                        );
                    })}

                {!imageLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                        <span className="animate-pulse text-sm font-medium">
                            Loading image...
                        </span>
                    </div>
                )}

                {/* Active Tooltip */}
                {activePointId && imageLoaded && !draggingPointId && (
                    <div className="pointer-events-none absolute top-4 left-1/2 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-sm font-medium text-white opacity-80 shadow-xl transition-opacity group-hover:opacity-100">
                        <Crosshair className="h-4 w-4 text-blue-400" />
                        {points.find((p) => p.id === activePointId)?.x === null
                            ? `Click anywhere to place ${points.find((p) => p.id === activePointId)?.label}`
                            : `Drag to move ${points.find((p) => p.id === activePointId)?.label}`}
                    </div>
                )}
            </div>

            <p className="flex justify-between px-1 text-xs text-muted-foreground">
                <span>
                    {imageLoaded
                        ? `Original Image Resolution: ${naturalSize.w}x${naturalSize.h}px`
                        : 'Loading resolution...'}
                </span>
                {activePointId && (
                    <span>Hold and drag any point to adjust it</span>
                )}
            </p>
        </div>
    );
}
