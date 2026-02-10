"use client";

import { useDroppable } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KanbanColumnProps {
    id: TaskStatus;
    title: string;
    color: string;
    tasks: Task[];
    onAddTask?: (status: TaskStatus) => void;
    onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, color, tasks, onAddTask, onTaskClick }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                "flex flex-col w-[300px] min-w-[300px] rounded-xl glass-card transition-all duration-200",
                isOver && "drop-target"
            )}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <div className={cn("h-2.5 w-2.5 rounded-full", color)} />
                    <h3 className="font-medium text-foreground">{title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {tasks.length}
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => onAddTask?.(id)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Tasks */}
            <ScrollArea className="flex-1 p-3">
                <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {tasks.map((task) => (
                            <TaskCard key={task._id} task={task} onClick={onTaskClick} />
                        ))}

                        {tasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                    <Plus className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No tasks</p>
                                <p className="text-xs text-muted-foreground/60">Drop here or add new</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </ScrollArea>
        </div>
    );
}
