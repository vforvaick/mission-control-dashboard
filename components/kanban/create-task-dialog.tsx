"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultBoardId?: Id<"boards">;
    defaultStatus?: TaskStatus;
}

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

export function CreateTaskDialog({
    open,
    onOpenChange,
    defaultBoardId,
    defaultStatus = "backlog",
}: CreateTaskDialogProps) {
    const rawBoards = useQuery(api.boards.list);
    const boards = rawBoards ?? [];
    const createTask = useMutation(api.tasks.create);
    const moveTask = useMutation(api.tasks.move);

    const initialBoardId = useMemo(
        () => defaultBoardId ?? (rawBoards?.[0]?._id as Id<"boards"> | undefined),
        [rawBoards, defaultBoardId]
    );

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [selectedBoardId, setSelectedBoardId] = useState<Id<"boards"> | undefined>(initialBoardId);
    const [tagsInput, setTagsInput] = useState("");
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [acceptanceCriteria, setAcceptanceCriteria] = useState("");
    const [requiredSkillsInput, setRequiredSkillsInput] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setTitle("");
        setDescription("");
        setPriority("medium");
        setSelectedBoardId(initialBoardId);
        setTagsInput("");
        setDueDate(undefined);
        setAcceptanceCriteria("");
        setRequiredSkillsInput("");
        setSubmitting(false);
        setError(null);
    }, [open, initialBoardId]);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError("Title is required.");
            return;
        }
        if (!selectedBoardId) {
            setError("Board is required.");
            return;
        }

        const tags = tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
        const requiredSkills = requiredSkillsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

        setSubmitting(true);
        try {
            const taskId = await createTask({
                boardId: selectedBoardId,
                title: title.trim(),
                description: description.trim() || undefined,
                createdBy: "human",
                acceptanceCriteria: acceptanceCriteria.trim() || undefined,
                requiredSkills: requiredSkills.length ? requiredSkills : undefined,
                priority,
                tags: tags.length ? tags : undefined,
                dueDate: dueDate ? dueDate.getTime() : undefined,
            });

            if (defaultStatus !== "backlog") {
                await moveTask({ id: taskId, status: defaultStatus });
            }

            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create task");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Create Task</DialogTitle>
                    <DialogDescription>
                        Add a new task to the mission board.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={200}
                            placeholder="Implement board-level filtering"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                            id="task-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={5000}
                            placeholder="Context, constraints, and expected output."
                            rows={4}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <Label>Board</Label>
                            <Select
                                value={selectedBoardId}
                                onValueChange={(value) => setSelectedBoardId(value as Id<"boards">)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select board" />
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
                            <Label htmlFor="task-tags">Tags</Label>
                            <Input
                                id="task-tags"
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
                                    <Calendar
                                        mode="single"
                                        selected={dueDate}
                                        onSelect={setDueDate}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-acceptance">Acceptance Criteria</Label>
                        <Textarea
                            id="task-acceptance"
                            value={acceptanceCriteria}
                            onChange={(e) => setAcceptanceCriteria(e.target.value)}
                            maxLength={5000}
                            placeholder="Definition of done..."
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="task-skills">Required Skills</Label>
                        <Input
                            id="task-skills"
                            value={requiredSkillsInput}
                            onChange={(e) => setRequiredSkillsInput(e.target.value)}
                            placeholder="react,convex,security"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting || !title.trim()}>
                            {submitting ? "Creating..." : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
