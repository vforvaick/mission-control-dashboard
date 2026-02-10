"use client";

import { FormEvent, useEffect, useState } from "react";
import { format } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { TaskPriority, TaskStatus } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskComments } from "./task-comments";

interface EditTaskDialogProps {
    taskId?: Id<"tasks">;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];
const statuses: TaskStatus[] = ["backlog", "todo", "in_progress", "review", "done"];

export function EditTaskDialog({ taskId, open, onOpenChange }: EditTaskDialogProps) {
    const task = useQuery(api.tasks.get, taskId ? { id: taskId } : "skip");
    const boards = useQuery(api.boards.list) ?? [];
    const updateTask = useMutation(api.tasks.update);
    const moveTask = useMutation(api.tasks.move);
    const removeTask = useMutation(api.tasks.remove);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [status, setStatus] = useState<TaskStatus>("backlog");
    const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | undefined>(undefined);
    const [tagsInput, setTagsInput] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
    const [requiredSkillsInput, setRequiredSkillsInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!task || !open) return;
        setTitle(task.title);
        setDescription(task.description ?? "");
        setPriority(task.priority);
        setStatus(task.status);
        setSelectedBoardId(task.boardId);
        setTagsInput((task.tags ?? []).join(", "));
        setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
        setAcceptanceCriteria(task.acceptanceCriteria ?? "");
        setRequiredSkillsInput((task.requiredSkills ?? []).join(", "));
        setError(null);
        setSubmitting(false);
    }, [task, open]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        if (!taskId) return;
        if (!title.trim()) {
            setError("Title is required.");
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            const tags = tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
            const requiredSkills = requiredSkillsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);

            await updateTask({
                id: taskId,
                boardId: selectedBoardId,
                title: title.trim(),
                description: description.trim() || undefined,
                priority,
                tags: tags.length ? tags : undefined,
                dueDate: dueDate ? dueDate.getTime() : undefined,
                acceptanceCriteria: acceptanceCriteria.trim() || undefined,
                requiredSkills: requiredSkills.length ? requiredSkills : undefined,
            });

            if (task && status !== task.status) {
                await moveTask({ id: taskId, status });
            }

            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update task");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!taskId) return;
        setSubmitting(true);
        try {
            await removeTask({ id: taskId });
            setDeleteOpen(false);
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete task");
            setSubmitting(false);
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                        <DialogDescription>
                            Update task fields, move status, or manage discussion.
                        </DialogDescription>
                    </DialogHeader>

                    {!task && (
                        <p className="text-sm text-muted-foreground">Loading task...</p>
                    )}

                    {task && (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-task-title">Title</Label>
                                <Input
                                    id="edit-task-title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={200}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-task-description">Description</Label>
                                <Textarea
                                    id="edit-task-description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    maxLength={5000}
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {priorities.map((p) => (
                                                <SelectItem key={p} value={p}>
                                                    {p}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s} value={s}>
                                                    {s.replace("_", " ")}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Board</Label>
                                    <Select
                                        value={selectedBoardId}
                                        onValueChange={(value) => setSelectedBoardId(value as Id<"boards">)}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {boards.map((board) => (
                                                <SelectItem key={board._id} value={board._id}>
                                                    {board.icon ?? "📌"} {board.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-task-tags">Tags</Label>
                                    <Input
                                        id="edit-task-tags"
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        placeholder="ui,convex,urgent"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Due date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !dueDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-task-acceptance">Acceptance Criteria</Label>
                                <Textarea
                                    id="edit-task-acceptance"
                                    value={acceptanceCriteria}
                                    onChange={(e) => setAcceptanceCriteria(e.target.value)}
                                    maxLength={5000}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-task-skills">Required Skills</Label>
                                <Input
                                    id="edit-task-skills"
                                    value={requiredSkillsInput}
                                    onChange={(e) => setRequiredSkillsInput(e.target.value)}
                                    placeholder="react,convex,security"
                                />
                            </div>

                            <div className="space-y-2 border-t border-border/50 pt-4">
                                <h4 className="text-sm font-semibold">Comments</h4>
                                <TaskComments taskId={task._id} />
                            </div>

                            {error && <p className="text-sm text-red-400">{error}</p>}

                            <DialogFooter className="justify-between">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="mr-auto"
                                    onClick={() => setDeleteOpen(true)}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting || !title.trim()}>
                                    {submitting ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete task?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction variant="destructive" onClick={handleDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
