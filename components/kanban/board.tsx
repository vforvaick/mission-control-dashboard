"use client";

import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
    DragOverEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./column";
import { TaskCard } from "./task-card";
import { Task, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";

// Mock data for now - will be replaced with Convex real-time data
const initialTasks: Task[] = [
    {
        _id: "1",
        title: "Set up project infrastructure",
        description: "Initialize Next.js project with all dependencies",
        status: "done",
        priority: "high",
        domain: "Deployment",
        assignedTo: "killua",
        createdAt: new Date().toISOString(),
    },
    {
        _id: "2",
        title: "Design agent avatar system",
        description: "Create 13 unique anime-style portraits for each agent",
        status: "in_progress",
        priority: "medium",
        domain: "Personal",
        assignedTo: "yor",
        createdAt: new Date().toISOString(),
    },
    {
        _id: "3",
        title: "Implement real-time sync",
        description: "Connect Convex backend for live task updates",
        status: "todo",
        priority: "high",
        domain: "Deployment",
        assignedTo: "killua",
        createdAt: new Date().toISOString(),
    },
    {
        _id: "4",
        title: "Review trading strategy",
        description: "Analyze market conditions and adjust parameters",
        status: "todo",
        priority: "urgent",
        domain: "Trading",
        assignedTo: "shiroe",
        createdAt: new Date().toISOString(),
    },
    {
        _id: "5",
        title: "Update documentation",
        description: "Complete API documentation for new endpoints",
        status: "review",
        priority: "medium",
        domain: "Office",
        assignedTo: "albedo",
        createdAt: new Date().toISOString(),
    },
    {
        _id: "6",
        title: "Security audit",
        description: "Run vulnerability scan on production services",
        status: "in_progress",
        priority: "high",
        domain: "Deployment",
        assignedTo: "demiurge",
        createdAt: new Date().toISOString(),
    },
];

const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "backlog", title: "Backlog", color: "bg-zinc-500" },
    { id: "todo", title: "To Do", color: "bg-blue-500" },
    { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
    { id: "review", title: "Review", color: "bg-purple-500" },
    { id: "done", title: "Done", color: "bg-green-500" },
];

export function KanbanBoard() {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const tasksByColumn = useMemo(() => {
        return columns.reduce((acc, column) => {
            acc[column.id] = tasks.filter((task) => task.status === column.id);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t._id === event.active.id);
        if (task) {
            setActiveTask(task);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find((t) => t._id === activeId);
        if (!activeTask) return;

        // Check if dropping on a column
        const overColumn = columns.find((col) => col.id === overId);
        if (overColumn) {
            setTasks((prev) =>
                prev.map((task) =>
                    task._id === activeId ? { ...task, status: overColumn.id } : task
                )
            );
            return;
        }

        // Check if dropping on another task
        const overTask = tasks.find((t) => t._id === overId);
        if (overTask && activeTask.status !== overTask.status) {
            setTasks((prev) =>
                prev.map((task) =>
                    task._id === activeId ? { ...task, status: overTask.status } : task
                )
            );
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeTask = tasks.find((t) => t._id === activeId);
        const overTask = tasks.find((t) => t._id === overId);

        if (activeTask && overTask && activeTask.status === overTask.status) {
            const columnTasks = tasksByColumn[activeTask.status];
            const activeIndex = columnTasks.findIndex((t) => t._id === activeId);
            const overIndex = columnTasks.findIndex((t) => t._id === overId);

            const newOrder = arrayMove(columnTasks, activeIndex, overIndex);

            setTasks((prev) => {
                const otherTasks = prev.filter((t) => t.status !== activeTask.status);
                return [...otherTasks, ...newOrder];
            });
        }
    }

    return (
        <div className="space-y-4">
            {/* Board Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">All Domains</h2>
                    <Badge variant="secondary" className="text-xs">
                        {tasks.length} tasks
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Live sync</span>
                </div>
            </div>

            {/* Kanban Columns */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((column) => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={tasksByColumn[column.id]}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard task={activeTask} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
