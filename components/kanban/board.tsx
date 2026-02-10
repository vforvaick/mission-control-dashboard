"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./column";
import { TaskCard } from "./task-card";
import { Task, TaskStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from "./create-task-dialog";
import { EditTaskDialog } from "./edit-task-dialog";

const columns: { id: TaskStatus; title: string; color: string }[] = [
    { id: "backlog", title: "Backlog", color: "bg-zinc-500" },
    { id: "todo", title: "To Do", color: "bg-blue-500" },
    { id: "in_progress", title: "In Progress", color: "bg-yellow-500" },
    { id: "review", title: "Review", color: "bg-purple-500" },
    { id: "done", title: "Done", color: "bg-green-500" },
];

export function KanbanBoard() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const boards = useQuery(api.boards.list);
    const agents = useQuery(api.agents.list);

    const selectedBoardSlug = searchParams.get("board");
    const selectedBoard = useMemo(() => {
        if (!boards || !selectedBoardSlug) return null;
        return boards.find((board) => board.slug === selectedBoardSlug) ?? null;
    }, [boards, selectedBoardSlug]);

    const rawTasks = useQuery(
        api.tasks.list,
        selectedBoard ? { boardId: selectedBoard._id } : {}
    );

    const moveTask = useMutation(api.tasks.move);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createStatus, setCreateStatus] = useState<TaskStatus>("backlog");
    const [editTaskId, setEditTaskId] = useState<Id<"tasks"> | undefined>(undefined);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Build agent handle map for display
    const agentMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (agents) {
            for (const a of agents) {
                map[a._id] = a.handle.replace(/^@/, "");
            }
        }
        return map;
    }, [agents]);

    // Build board maps
    const boardDomainMap = useMemo(() => {
        const map: Record<string, string> = {};
        if (boards) {
            for (const b of boards) {
                map[b._id] = b.name.split(" ")[0];
            }
        }
        return map;
    }, [boards]);

    const boardSlugById = useMemo(() => {
        const map: Record<string, string> = {};
        if (boards) {
            for (const b of boards) map[b._id] = b.slug;
        }
        return map;
    }, [boards]);

    // Map Convex tasks to dashboard Task type
    const tasks: Task[] = useMemo(() => {
        if (!rawTasks) return [];
        return rawTasks.map((t) => ({
            _id: t._id,
            title: t.title,
            description: t.description,
            status: t.status as TaskStatus,
            priority: t.priority as Task["priority"],
            domain: (boardDomainMap[t.boardId] || "Office") as Task["domain"],
            assignedTo: t.assigneeId ? agentMap[t.assigneeId] : undefined,
            createdAt: new Date(t.createdAt).toISOString(),
            updatedAt: t.updatedAt ? new Date(t.updatedAt).toISOString() : undefined,
            completedAt: t.completedAt ? new Date(t.completedAt).toISOString() : undefined,
            boardId: t.boardId,
            tags: t.tags,
            dueDate: t.dueDate,
            acceptanceCriteria: t.acceptanceCriteria,
            requiredSkills: t.requiredSkills,
        }));
    }, [rawTasks, agentMap, boardDomainMap]);

    const tasksByColumn = useMemo(() => {
        return columns.reduce((acc, column) => {
            acc[column.id] = tasks
                .filter((task) => task.status === column.id)
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [tasks]);

    if (!rawTasks) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-7 w-32" />
                    <Skeleton className="h-5 w-16" />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {columns.map((col) => (
                        <Skeleton key={col.id} className="min-w-[280px] h-96 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    function setBoardFilter(slug: string | null) {
        const next = new URLSearchParams(searchParams.toString());
        if (slug) {
            next.set("board", slug);
        } else {
            next.delete("board");
        }
        const query = next.toString();
        router.replace(query ? `/?${query}` : "/");
    }

    function handleCreateAtStatus(status: TaskStatus) {
        setCreateStatus(status);
        setCreateDialogOpen(true);
    }

    function handleTaskClick(task: Task) {
        setEditTaskId(task._id as Id<"tasks">);
    }

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t._id === event.active.id);
        if (task) setActiveTask(task);
    }

    async function handleDragEnd(event: DragEndEvent) {
        setActiveTask(null);
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const draggedTask = tasks.find((t) => t._id === activeId);
        if (!draggedTask) return;

        // Determine target column
        const overColumn = columns.find((col) => col.id === overId);
        const overTask = tasks.find((t) => t._id === overId);
        const targetStatus = overColumn?.id || overTask?.status;

        if (targetStatus && targetStatus !== draggedTask.status) {
            try {
                await moveTask({
                    id: activeId as Id<"tasks">,
                    status: targetStatus,
                });
            } catch (err) {
                console.error("Failed to move task:", err);
            }
        }
    }

    return (
        <div className="space-y-4">
            {/* Board Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">
                        {selectedBoard ? selectedBoard.name : "All Domains"}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                        {tasks.length} tasks
                    </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Live sync</span>
                </div>
            </div>

            {/* Board Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    size="sm"
                    variant={!selectedBoard ? "default" : "outline"}
                    onClick={() => setBoardFilter(null)}
                >
                    All
                </Button>
                {(boards ?? []).map((board) => (
                    <Button
                        key={board._id}
                        size="sm"
                        variant={selectedBoard?._id === board._id ? "default" : "outline"}
                        onClick={() => setBoardFilter(boardSlugById[board._id])}
                    >
                        {board.icon ?? "📌"} {board.name.split(" ")[0]}
                    </Button>
                ))}
            </div>

            {/* Kanban Columns */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
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
                            onAddTask={handleCreateAtStatus}
                            onTaskClick={handleTaskClick}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <TaskCard task={activeTask} isDragging />
                    ) : null}
                </DragOverlay>
            </DndContext>

            <CreateTaskDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                defaultBoardId={selectedBoard?._id}
                defaultStatus={createStatus}
            />

            <EditTaskDialog
                taskId={editTaskId}
                open={Boolean(editTaskId)}
                onOpenChange={(open) => {
                    if (!open) setEditTaskId(undefined);
                }}
            />
        </div>
    );
}
