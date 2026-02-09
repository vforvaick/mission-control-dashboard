"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Task, priorityColors, agentColors } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    GripVertical,
    Clock,
    AlertTriangle,
    CheckCircle2,
    MessageSquare
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaskCardProps {
    task: Task;
    isDragging?: boolean;
}

const domainEmojis: Record<string, string> = {
    Office: "🏢",
    Trading: "📈",
    Personal: "🎯",
    Deployment: "🚀",
};

export function TaskCard({ task, isDragging }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isActive = isDragging || isSortableDragging;

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "group cursor-grab active:cursor-grabbing transition-all duration-200 border-border/50 bg-card hover:border-border hover:bg-card/80",
                isActive && "dragging opacity-50 rotate-2 z-50",
                task.priority === "urgent" && "border-l-2 border-l-primary"
            )}
            {...attributes}
            {...listeners}
        >
            <CardContent className="p-3 space-y-3">
                {/* Header with drag handle and domain */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-muted-foreground/20"
                        >
                            {domainEmojis[task.domain]} {task.domain}
                        </Badge>
                    </div>
                    <Badge className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                        {task.priority === "urgent" && <AlertTriangle className="h-2.5 w-2.5 mr-1" />}
                        {task.priority}
                    </Badge>
                </div>

                {/* Title */}
                <h4 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">
                    {task.title}
                </h4>

                {/* Description (if exists) */}
                {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {task.description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    {/* Assignee */}
                    {task.assignedTo ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6 border border-border">
                                        <AvatarImage src={`/avatars/${task.assignedTo}.png`} />
                                        <AvatarFallback
                                            className="text-[10px] font-bold text-white"
                                            style={{ backgroundColor: agentColors[task.assignedTo] || "#6366f1" }}
                                        >
                                            {task.assignedTo.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs text-muted-foreground">
                                        @{task.assignedTo}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Assigned to @{task.assignedTo}</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                            <div className="h-6 w-6 rounded-full border border-dashed border-muted-foreground/30 flex items-center justify-center">
                                <span className="text-[10px]">?</span>
                            </div>
                            Unassigned
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        {task.status === "done" && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 text-xs">
                                    <Clock className="h-3 w-3" />
                                    <span>2h</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Created 2 hours ago</p>
                            </TooltipContent>
                        </Tooltip>
                        <div className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
