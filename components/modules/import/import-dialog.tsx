"use client";

import {
  AlertCircleIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClipboardCopyIcon,
  DownloadIcon,
  FileUpIcon,
  FolderKanbanIcon,
  UploadIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { parseCsv, type ParsedImport } from "./csv-parser";
import { downloadTemplate, AI_IMPORT_PROMPT } from "./template-download";
import { useImportProject } from "./use-import";

type Step = "upload" | "preview" | "result";

function WarningsPanel({
  warnings,
  copied,
  onCopy,
}: {
  warnings: string[];
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="size-3.5 shrink-0" />
          {warnings.length} warning{warnings.length !== 1 ? "s" : ""} — affected fields will use
          defaults
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 gap-1 px-2 text-xs text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
          onClick={onCopy}
        >
          {copied ? (
            <>
              <CheckCircle2Icon className="size-3" />
              Copied
            </>
          ) : (
            <>
              <ClipboardCopyIcon className="size-3" />
              Copy for AI
            </>
          )}
        </Button>
      </div>
      <div className="max-h-28 overflow-y-auto px-3 pb-2">
        <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
          {warnings.map((w, i) => (
            <li key={i} className="flex gap-1.5">
              <span className="shrink-0 select-none">•</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

interface ImportResult {
  projectId: string;
  projectName: string;
  tasksCreated: number;
  dependenciesCreated: number;
}

function isCsvFile(file: File) {
  if (file.type === "text/csv" || file.type === "application/csv") return true;
  return file.name.toLowerCase().endsWith(".csv");
}

export function ImportProjectDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [promptCopied, setPromptCopied] = useState(false);
  const [warningsCopied, setWarningsCopied] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [isImporting, setIsImporting] = useState(false);

  const importProject = useImportProject();

  function reset() {
    setStep("upload");
    setParsed(null);
    setParseError(null);
    setResult(null);
    setPromptCopied(false);
    setWarningsCopied(false);
    setIsDragging(false);
    dragDepthRef.current = 0;
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) reset();
  }

  async function ingestFile(file: File) {
    setParseError(null);
    setParsed(null);
    if (!isCsvFile(file)) {
      setParseError("Only .csv files are supported.");
      return;
    }
    try {
      const data = await parseCsv(file);
      setParsed(data);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : "Failed to parse CSV.");
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await ingestFile(file);
  }

  function handleDragEnter(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    if (!e.dataTransfer.types.includes("Files")) return;
    dragDepthRef.current += 1;
    setIsDragging(true);
  }

  function handleDragOver(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragLeave(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (e.dataTransfer.files.length > 1) {
      setParseError("Drop one .csv file at a time.");
      return;
    }
    await ingestFile(file);
  }

  async function handleImport() {
    if (!parsed || isImporting) return;
    setIsImporting(true);
    try {
      const res = await importProject.mutateAsync({
        name: parsed.projectName,
        description: parsed.projectDescription,
        tasks: parsed.tasks,
      });
      setResult(res);
      setStep("result");
    } catch {
      toast.error("Import failed. Please check the data and try again.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleDownloadTemplate() {
    setTemplateLoading(true);
    try {
      await downloadTemplate();
    } catch {
      toast.error("Failed to generate template.");
    } finally {
      setTemplateLoading(false);
    }
  }

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(AI_IMPORT_PROMPT);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  }

  async function handleCopyWarnings() {
    if (!parsed?.warnings.length) return;
    const text = [
      "I have a CSV file for project import that produced the following warnings.",
      "Please help me correct the CSV so all these issues are fixed.",
      "",
      "WARNINGS:",
      ...parsed.warnings.map((w) => `- ${w}`),
      "",
      "Paste your original CSV below and I will return a corrected version:",
      "(paste your CSV here)",
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setWarningsCopied(true);
    setTimeout(() => setWarningsCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UploadIcon className="mr-2 size-4" />
          Import
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        {step === "upload" && (
          <>
            <DialogHeader>
              <DialogTitle>Import a project</DialogTitle>
              <DialogDescription>
                Upload a CSV to create a project with all its tasks and dependencies at once.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Step indicators */}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">1. Prepare CSV</span>
                <span>→</span>
                <span>2. Preview</span>
                <span>→</span>
                <span>3. Import</span>
              </div>

              {/* Prepare helpers */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DownloadIcon className="size-4 text-muted-foreground" />
                    Download template
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get an XLSX file with the right columns and example rows. Includes an AI prompt
                    on a second sheet.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={handleDownloadTemplate}
                    disabled={templateLoading}
                  >
                    {templateLoading ? "Generating…" : "Download template"}
                  </Button>
                </div>

                <div className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <ClipboardCopyIcon className="size-4 text-muted-foreground" />
                    Convert with AI
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Copy the prompt below, paste it into any AI tool (ChatGPT, Claude, Gemini…), and
                    paste your project description after it.
                  </p>
                  <Button size="sm" variant="outline" className="w-full" onClick={handleCopyPrompt}>
                    {promptCopied ? (
                      <>
                        <CheckCircle2Icon className="mr-2 size-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      "Copy AI prompt"
                    )}
                  </Button>
                </div>
              </div>

              {/* Upload area */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Upload CSV</p>
                <label
                  htmlFor="csv-upload"
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 cursor-pointer transition-colors ${
                    isDragging ? "border-primary bg-primary/5" : "hover:bg-muted/40"
                  }`}
                >
                  <FileUpIcon
                    className={`size-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isDragging ? "Drop the .csv file" : "Click or drag a .csv file here"}
                  </span>
                  <input
                    ref={fileRef}
                    id="csv-upload"
                    type="file"
                    accept=".csv,text/csv"
                    className="sr-only"
                    onChange={handleFileChange}
                  />
                </label>

                {parseError && (
                  <div className="flex items-start gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}

                {parsed && (
                  <div className="space-y-2">
                    <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                      <p className="font-medium">{parsed.projectName}</p>
                      <p className="text-muted-foreground">
                        {parsed.tasks.length} task{parsed.tasks.length !== 1 ? "s" : ""} detected
                        {parsed.projectDescription ? ` · ${parsed.projectDescription}` : ""}
                      </p>
                    </div>
                    {parsed.warnings.length > 0 && (
                      <WarningsPanel
                        warnings={parsed.warnings}
                        copied={warningsCopied}
                        onCopy={handleCopyWarnings}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={() => setStep("preview")} disabled={!parsed}>
                Preview · {parsed ? `${parsed.tasks.length} tasks` : ""}
              </Button>
            </div>
          </>
        )}

        {step === "preview" && parsed && (
          <>
            <DialogHeader>
              <DialogTitle>Preview import</DialogTitle>
              <DialogDescription>
                Review the tasks before creating{" "}
                <span className="font-medium text-foreground">{parsed.projectName}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>1. Prepare CSV</span>
                <span>→</span>
                <span className="font-medium text-foreground">2. Preview</span>
                <span>→</span>
                <span>3. Import</span>
              </div>

              <ScrollArea className="h-72 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Parent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Labels</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsed.tasks.map((task, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium max-w-[140px] truncate">
                          {task.parentTask && <span className="mr-1 text-muted-foreground">↳</span>}
                          {task.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs max-w-[80px] truncate">
                          {task.parentTask ?? "—"}
                        </TableCell>
                        <TableCell>
                          {task.status ? (
                            <Badge variant="outline" className="text-xs">
                              {task.status}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">TODO</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {task.priority ? (
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">MEDIUM</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.startDate ?? "—"} → {task.endDate ?? "—"}
                        </TableCell>
                        <TableCell className="max-w-[80px] truncate text-xs text-muted-foreground">
                          {task.labels?.length ? task.labels.join(", ") : "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {task.dueDate ?? "—"}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[80px] truncate">
                          {task.assignee ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>

              <p className="text-xs text-muted-foreground">
                {parsed.tasks.filter((t) => t.dependsOn?.length).length} task
                {parsed.tasks.filter((t) => t.dependsOn?.length).length !== 1 ? "s" : ""} have
                dependencies · {parsed.tasks.filter((t) => t.parentTask).length} subtask
                {parsed.tasks.filter((t) => t.parentTask).length !== 1 ? "s" : ""}
              </p>

              {parsed.warnings.length > 0 && (
                <WarningsPanel
                  warnings={parsed.warnings}
                  copied={warningsCopied}
                  onCopy={handleCopyWarnings}
                />
              )}

              {importProject.isPending && (
                <Progress value={undefined} className="h-1 animate-pulse" />
              )}
            </div>

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setStep("upload")}>
                Back
              </Button>
              <Button onClick={handleImport} disabled={isImporting}>
                {isImporting ? "Importing…" : `Import ${parsed.tasks.length} tasks`}
              </Button>
            </div>
          </>
        )}

        {step === "result" && result && (
          <>
            <DialogHeader>
              <DialogTitle>Import complete</DialogTitle>
              <DialogDescription>
                Your project is ready. You can find it in the projects list.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                  <CheckCircle2Icon className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">{result.projectName}</p>
                  <p className="text-sm text-muted-foreground">Project created successfully</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{result.tasksCreated}</p>
                  <p className="text-xs text-muted-foreground">tasks created</p>
                </div>
                <div className="rounded-lg border p-3 text-center">
                  <p className="text-2xl font-bold">{result.dependenciesCreated}</p>
                  <p className="text-xs text-muted-foreground">dependencies wired</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
                <FolderKanbanIcon className="size-4 text-muted-foreground shrink-0" />
                <span>
                  Open <span className="font-medium">Projects</span> to find your new project.
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => handleOpenChange(false)}>Done</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
