'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Trash2, GripVertical } from 'lucide-react';

interface SortableItemProps {
    item: any;
    onRemove: (id: string, e: any) => void;
}

export function SortableWatchlistItem({ item, onRemove }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as 'relative',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} className="h-full touch-none select-none">
            <Card className={`relative hover:bg-gray-50 dark:hover:bg-gray-800 transition-all h-full group flex flex-col ${isDragging ? 'ring-2 ring-blue-500 shadow-xl' : ''}`}>

                {/* Drag Handle */}
                <div
                    {...listeners}
                    className="absolute top-2 right-2 p-2 cursor-grab active:cursor-grabbing z-20 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Sürükle"
                >
                    <GripVertical size={20} />
                </div>

                <Link href={`/symbol/${item.market}/${item.symbol}`} className="block h-full flex-1" draggable={false}>
                    <CardHeader className="pb-10 pt-6"> {/* Added pt-6 for spacing if needed */}
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{item.symbol}</CardTitle>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]" title={item.quote?.name}>
                                    {item.quote?.name || item.market}
                                </div>
                            </div>
                            <div className="text-right pr-6"> {/* Added pr-6 to avoid overlap with handle if visible */}
                                {item.quote ? (
                                    <>
                                        <div className="text-lg font-bold">
                                            {item.market === 'US' ? '$' : '₺'}{item.quote.price?.toFixed(2)}
                                        </div>
                                        <div className={`text-sm font-medium ${item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.quote.change >= 0 ? '+' : ''}{item.quote.changePercent?.toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-pulse bg-gray-200 h-6 w-16 rounded"></div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Link>

                {/* Delete Button */}
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => onRemove(item.id, e)}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all z-20"
                    title="Listeden Çıkar"
                >
                    <Trash2 size={16} />
                </button>
            </Card>
        </div>
    );
}
