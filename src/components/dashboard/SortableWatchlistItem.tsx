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
                    className="absolute top-1.5 right-1.5 p-1.5 cursor-grab active:cursor-grabbing z-20 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Sürükle"
                >
                    <GripVertical size={16} />
                </div>

                <Link href={`/symbol/${item.market}/${item.symbol}`} className="block h-full flex-1" draggable={false}>
                    <CardHeader className="pb-8 pt-4 px-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base">{item.symbol}</CardTitle>
                                <div className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={item.quote?.name}>
                                    {item.quote?.name || item.market}
                                </div>
                            </div>
                            <div className="text-right pr-5">
                                {item.quote ? (
                                    <>
                                        <div className="text-base font-bold">
                                            {item.market === 'US' ? '$' : '₺'}{item.quote.price?.toFixed(2)}
                                        </div>
                                        <div className={`text-xs font-medium ${item.quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {item.quote.change >= 0 ? '+' : ''}{item.quote.changePercent?.toFixed(2)}%
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-pulse bg-gray-200 h-5 w-14 rounded"></div>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Link>

                {/* Delete Button */}
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => onRemove(item.id, e)}
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-all z-20"
                    title="Listeden Çıkar"
                >
                    <Trash2 size={14} />
                </button>
            </Card>
        </div>
    );
}
