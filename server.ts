import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import os from "os";
import { exec as execCallback } from "child_process";
import { promisify } from "util";

const exec = promisify(execCallback);

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialize Gemini clients to prevent crash on empty key
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please set it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

app.use(express.json());

// Stable ESM/CJS relative path resolution for the local database
let tasksDirectory = process.cwd();
try {
  if (typeof import.meta.url === "string") {
    tasksDirectory = path.dirname(fileURLToPath(import.meta.url));
  }
} catch (e) {
  if (typeof __dirname === "string") {
    tasksDirectory = __dirname;
  }
}

// If running from production dist folder, step up to the project root
if (path.basename(tasksDirectory) === "dist") {
  tasksDirectory = path.dirname(tasksDirectory);
}

const TASKS_FILE_PATH = path.join(tasksDirectory, "todo.json");

// Backup location in user's permanent App Data Directory
const BACKUP_DIR = path.join(os.homedir(), ".gemini", "antigravity");
const BACKUP_FILE_PATH = path.join(BACKUP_DIR, "todo_backup.json");

// Helper to read tasks with automatic recovery from backup
async function readTasks(): Promise<any[]> {
  let workspaceTasks: any[] = [];
  let workspaceReadSuccess = false;

  // 1. Try to read from project workspace todo.json
  try {
    const data = await fs.readFile(TASKS_FILE_PATH, "utf-8");
    workspaceTasks = JSON.parse(data);
    workspaceReadSuccess = true;
  } catch (err) {
    console.warn("Workspace todo.json not found or failed to read. Attempting backup recovery...");
  }

  // 2. If workspace file read failed OR is empty, attempt recovery from permanent backup
  if (!workspaceReadSuccess || workspaceTasks.length === 0) {
    try {
      const backupData = await fs.readFile(BACKUP_FILE_PATH, "utf-8");
      const backupTasks = JSON.parse(backupData);
      
      if (Array.isArray(backupTasks) && backupTasks.length > 0) {
        console.log(`Successfully recovered ${backupTasks.length} tasks from AppData backup! Syncing to workspace.`);
        // Auto-restore back to workspace todo.json
        await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(backupTasks, null, 2), "utf-8");
        return backupTasks;
      }
    } catch (backupErr) {
      console.warn("No backup found or backup file is empty/corrupt.");
    }
  }

  return workspaceTasks;
}

// Helper to write tasks with dual-write replication (Workspace + Permanent Backup)
async function writeTasks(tasks: any[]): Promise<boolean> {
  try {
    if (process.env.NODE_ENV === "production") {
      console.warn("Attempted to write tasks in production mode. Prevented.");
      return false;
    }

    // 1. Write to the workspace todo.json
    await fs.writeFile(TASKS_FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");

    // 2. Replication: Write duplicate copy to user's App Data Directory backup
    try {
      await fs.mkdir(BACKUP_DIR, { recursive: true });
      await fs.writeFile(BACKUP_FILE_PATH, JSON.stringify(tasks, null, 2), "utf-8");
    } catch (backupErr) {
      console.error("Failed to write tasks to permanent backup path:", backupErr);
    }

    return true;
  } catch (err) {
    console.error("Error writing tasks file:", err);
    return false;
  }
}

// Express Endpoints for Dev Tasks
app.get("/api/dev/tasks", async (req, res) => {
  const tasks = await readTasks();
  res.json(tasks);
});

app.post("/api/dev/tasks", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { title, description, tab, x, y, w, h, selector, rx, ry, rw, rh, priority, status } = req.body;
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "El título de la tarea es obligatorio." });
    }

    const tasks = await readTasks();
    const newTask = {
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      title: title.trim(),
      description: (description || "").trim(),
      tab: tab || "general",
      x: typeof x === "number" ? x : undefined,
      y: typeof y === "number" ? y : undefined,
      w: typeof w === "number" ? w : undefined,
      h: typeof h === "number" ? h : undefined,
      selector: typeof selector === "string" ? selector : undefined,
      rx: typeof rx === "number" ? rx : undefined,
      ry: typeof ry === "number" ? ry : undefined,
      rw: typeof rw === "number" ? rw : undefined,
      rh: typeof rh === "number" ? rh : undefined,
      priority: priority || "medium",
      status: status || "todo",
      createdAt: new Date().toISOString(),
    };

    tasks.push(newTask);
    const success = await writeTasks(tasks);
    if (!success) {
      return res.status(500).json({ error: "No se pudo guardar la tarea en el archivo." });
    }
    res.status(201).json(newTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/dev/tasks/:id", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const { title, description, priority, status, selector, rx, ry, rw, rh } = req.body;

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      title: title !== undefined ? title.trim() : tasks[taskIndex].title,
      description: description !== undefined ? description.trim() : tasks[taskIndex].description,
      priority: priority !== undefined ? priority : tasks[taskIndex].priority,
      status: status !== undefined ? status : tasks[taskIndex].status,
      selector: selector !== undefined ? selector : tasks[taskIndex].selector,
      rx: rx !== undefined ? rx : tasks[taskIndex].rx,
      ry: ry !== undefined ? ry : tasks[taskIndex].ry,
      rw: rw !== undefined ? rw : tasks[taskIndex].rw,
      rh: rh !== undefined ? rh : tasks[taskIndex].rh,
    };

    tasks[taskIndex] = updatedTask;
    const success = await writeTasks(tasks);
    if (!success) {
      return res.status(500).json({ error: "No se pudo guardar la tarea actualizada." });
    }
    res.json(updatedTask);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/dev/tasks/:id", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const filteredTasks = tasks.filter((t) => t.id !== id);

    if (tasks.length === filteredTasks.length) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const success = await writeTasks(filteredTasks);
    if (!success) {
      return res.status(500).json({ error: "No se pudo eliminar la tarea." });
    }
    res.json({ message: "Tarea eliminada correctamente." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper for running Git commands securely in project root
async function runGit(cmd: string): Promise<{ stdout: string; stderr: string }> {
  try {
    const { stdout, stderr } = await exec(cmd, { cwd: tasksDirectory });
    return { stdout: stdout.trim(), stderr: stderr.trim() };
  } catch (err: any) {
    console.error(`Error running Git command: ${cmd}`, err);
    throw new Error(`Git error: ${err.message}`);
  }
}

// Endpoint: Obtener el estado actual de Git
app.get("/api/dev/git-status", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { stdout: branch } = await runGit("git branch --show-current");
    const { stdout: status } = await runGit("git status --porcelain");
    res.json({
      branch,
      hasUncommittedChanges: status.length > 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Iniciar previsualización en vivo de una tarea
app.post("/api/dev/tasks/:id/preview", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const task = tasks[taskIndex];
    const branchName = `ai-review-${id}`;

    // Verificar si la rama existe localmente
    try {
      await runGit(`git show-ref --verify refs/heads/${branchName}`);
    } catch (e) {
      return res.status(400).json({ error: `La rama ${branchName} para previsualizar no existe.` });
    }

    // Obtener la rama actual para recordarla como originalBranch
    const { stdout: currentBranch } = await runGit("git branch --show-current");
    
    // Si ya estamos en la rama de previsualización, no hacemos nada
    if (currentBranch === branchName) {
      return res.json({ success: true, activeBranch: branchName });
    }

    task.originalBranch = currentBranch;
    await writeTasks(tasks);

    // Si el usuario tiene cambios locales sin confirmar, los stasheamos
    const { stdout: status } = await runGit("git status --porcelain");
    if (status.length > 0) {
      console.log("Stashing local changes before preview...");
      await runGit(`git stash save "AI Preview Auto-Stash [${id}]"`);
      task.hasStashedChanges = true;
      await writeTasks(tasks);
    }

    // Hacer el checkout de la rama de la IA
    await runGit(`git checkout ${branchName}`);
    res.json({ success: true, activeBranch: branchName });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Aprobar y fusionar cambios de una tarea
app.post("/api/dev/tasks/:id/approve", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const task = tasks[taskIndex];
    const branchName = `ai-review-${id}`;
    const originalBranch = task.originalBranch || "main";

    // Cambiar de vuelta a la rama original del usuario
    await runGit(`git checkout ${originalBranch}`);

    // Fusionar la rama de la IA en la rama original
    console.log(`Merging ${branchName} into ${originalBranch}...`);
    await runGit(`git merge ${branchName} --no-edit -m "Merge branch '${branchName}' via AI Dev Board"`);

    // Eliminar la rama temporal
    try {
      await runGit(`git branch -D ${branchName}`);
    } catch (e) {
      console.warn("Failed to delete merged branch:", e);
    }

    // Deshacer el stash si existía alguno para esta previsualización
    if (task.hasStashedChanges) {
      try {
        console.log("Popping preview stash...");
        await runGit("git stash pop");
      } catch (stashErr) {
        console.warn("Failed to pop stash, local changes might be conflicted. Stash remains safe in Git history.", stashErr);
      }
    }

    // Limpiar el prefijo de título de la IA
    let cleanTitle = task.title;
    const prefixes = ["[IA: Listo para verificar]", "[IA: Listo para verificar (V2)]", "[IA: Ajustes Solicitados]", "[IA: Sugerencia de Diseño]"];
    for (const prefix of prefixes) {
      if (cleanTitle.startsWith(prefix)) {
        cleanTitle = cleanTitle.substring(prefix.length).trim();
      }
    }

    task.title = cleanTitle;
    task.status = "done";
    task.originalBranch = undefined;
    task.hasStashedChanges = undefined;
    task.aiFeedback = undefined;
    await writeTasks(tasks);

    res.json({ success: true, status: "done" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Rechazar y borrar cambios de una tarea
app.post("/api/dev/tasks/:id/reject", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const task = tasks[taskIndex];
    const branchName = `ai-review-${id}`;
    const originalBranch = task.originalBranch || "main";

    // Volver a la rama original
    await runGit(`git checkout ${originalBranch}`);

    // Borrar la rama de la IA
    try {
      await runGit(`git branch -D ${branchName}`);
    } catch (e) {
      console.warn(`Branch ${branchName} did not exist or could not be deleted.`);
    }

    // Deshacer el stash
    if (task.hasStashedChanges) {
      try {
        console.log("Popping preview stash on reject...");
        await runGit("git stash pop");
      } catch (stashErr) {
        console.warn("Failed to pop stash on reject.", stashErr);
      }
    }

    // Si es una sugerencia pura de la IA, la eliminamos; de lo contrario restauramos el TODO
    if (task.title.startsWith("[IA: Sugerencia de Diseño]")) {
      const filteredTasks = tasks.filter((t) => t.id !== id);
      await writeTasks(filteredTasks);
      return res.json({ success: true, deleted: true });
    } else {
      let cleanTitle = task.title;
      const prefixes = ["[IA: Listo para verificar]", "[IA: Listo para verificar (V2)]", "[IA: Ajustes Solicitados]"];
      for (const prefix of prefixes) {
        if (cleanTitle.startsWith(prefix)) {
          cleanTitle = cleanTitle.substring(prefix.length).trim();
        }
      }
      task.title = cleanTitle;
      task.status = "todo";
      task.originalBranch = undefined;
      task.hasStashedChanges = undefined;
      task.aiFeedback = undefined;
      await writeTasks(tasks);
      res.json({ success: true, status: "todo" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint: Enviar comentarios de ajuste (Feedback) a la IA
app.post("/api/dev/tasks/:id/feedback", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "No permitido en producción" });
  }
  try {
    const { id } = req.params;
    const { feedback } = req.body;

    if (!feedback || typeof feedback !== "string" || !feedback.trim()) {
      return res.status(400).json({ error: "El comentario no puede estar vacío." });
    }

    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex === -1) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    const task = tasks[taskIndex];
    const originalBranch = task.originalBranch || "main";

    // Volver a la rama original
    await runGit(`git checkout ${originalBranch}`);

    // Deshacer el stash
    if (task.hasStashedChanges) {
      try {
        console.log("Popping preview stash on feedback submission...");
        await runGit("git stash pop");
      } catch (stashErr) {
        console.warn("Failed to pop stash on feedback.", stashErr);
      }
    }

    let cleanTitle = task.title;
    const prefixes = ["[IA: Listo para verificar]", "[IA: Listo para verificar (V2)]", "[IA: Ajustes Solicitados]"];
    for (const prefix of prefixes) {
      if (cleanTitle.startsWith(prefix)) {
        cleanTitle = cleanTitle.substring(prefix.length).trim();
      }
    }

    task.title = `[IA: Ajustes Solicitados] ${cleanTitle}`;
    task.aiFeedback = feedback.trim();
    task.status = "todo";
    task.originalBranch = undefined;
    task.hasStashedChanges = undefined;
    
    await writeTasks(tasks);
    res.json({ success: true, updatedTask: task });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// API routes FIRST
app.post("/api/analyze-argument", async (req, res) => {
  try {
    const { argument, mode } = req.body;
    if (!argument || typeof argument !== "string" || !argument.trim()) {
      return res.status(400).json({ error: "El argumento ingresado está vacío o no es válido." });
    }

    const ai = getAiClient();
    let systemPrompt = `Eres la Inteligencia Artificial "Sintiens Dialéctica", un motor de análisis filosófico-científico en español. Tu objetivo es realizar una deconstrucción socrática, científica y bioética laica de los argumentos, reflexiones, dudas o justificaciones que utiliza el ser humano para consumir y explotar animales no humanos.
Analiza la premisa o pregunta introducida aplicando conceptos de neurobiología de la sintiencia, termodinámica de sistemas de recursos y lógica filosófica laica.
Devuelve tu diagnóstico EXACTAMENTE en formato JSON conforme a la estructura de esquema solicitada. Todo el contenido generado en el JSON debe estar en idioma Español.

`;

    if (mode === "socratic") {
      systemPrompt += `MODO SOCRÁTICO PURO: Tu tono debe ser extremadamente socrático e inquisitivo. Conduce a la reflexión a través de ironías dialécticas implícitas. Pon especial énfasis en la contradicción interna de la justificación, haciéndole preguntas incisivas y breves. El análisis científico debe deconstruir las premisas erróneas exponiendo sus contradicciones lógicas fundamentales de forma ágil y perspicaz.`;
    } else if (mode === "empathic") {
      systemPrompt += `MODO DIVULGACIÓN EMPÁTICA: Tu tono debe ser cálido, sumamente comprensivo, pedagógico y educador, evitando sonar clínico o confrontativo. Utiliza analogías cotidianas y accesibles. Apela al potencial empático humano y la compasión natural, estructurando los argumentos científicos de manera muy clara, divulgativa y libre de jerga obtusa.`;
    } else if (mode === "thermodynamic") {
      systemPrompt += `MODO TERMODINÁMICA RADICAL: Tu enfoque debe ser de física aplicada e ingeniería ecológica pura. Analiza la premisa desde las leyes de la física, la entropía de los sistemas cerrados, la drástica ineficiencia del paso trófico de calorías (pérdida de hasta un 90% por metabolismo animal), el uso de suelo y agua, y los límites biosféricos. Tu tono debe ser de una sobriedad matemática implacable y fría.`;
    } else {
      // Default: Clinical
      systemPrompt += `MODO DIALÉCTICA CLÍNICA: Mantén un tono clínico, profundo, altamente intelectual, respetuoso pero rigurosamente analítico, objetivo y académico. No utilices adjetivos floridos, sentimentalismos ni halagos comerciales. Utiliza conceptos sólidos de neurobiología, ética laica formal y ecología de sistemas complejos.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analiza y deconstruye críticamente la siguiente premisa: "${argument}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: [
            "argumentSummary",
            "axioms",
            "scientificAccuracy",
            "logicalFailures",
            "impactAnalysis",
            "alternativeReflection"
          ],
          properties: {
            argumentSummary: {
              type: Type.STRING,
              description: "Resumen breve, descriptivo e impactante de 3 a 7 palabras del argumento examinado."
            },
            axioms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 2 a 4 verdades absolutas o dogmas implícitos e inconscientes que asume este argumento sin examinarlos."
            },
            scientificAccuracy: {
              type: Type.OBJECT,
              required: ["rating", "analysis"],
              properties: {
                rating: {
                  type: Type.STRING,
                  description: "Una calificación técnica corta en mayúsculas (ej. 'INEXACTITUD BIOLÓGICA', 'DISONANCIA TERMOLÓGICA', 'FALACIA NATURALISTA', 'PARCIALMENTE INCOMPLETO')."
                },
                analysis: {
                  type: Type.STRING,
                  description: "Un párrafo de análisis objetivo y clínico fundamentado en hechos de la ciencia empírica moderna (neurobiología, evolución o termodinámica)."
                }
              }
            },
            logicalFailures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Lista de 1 a 3 sesgos lógicos, falacias dialécticas o mecanismos de disonancia cognitiva presentes en la asimilación del argumento."
            },
            impactAnalysis: {
              type: Type.OBJECT,
              required: ["sintiente", "ecosistemic"],
              properties: {
                sintiente: {
                  type: Type.STRING,
                  description: "Consecuencias fácticas y directas que tiene esta asunción sobre la conciencia, estrés o dolor individual del animal sintiente implicado."
                },
                ecosistemic: {
                  type: Type.STRING,
                  description: "El desgaste calórico colateral, emisiones gaseosas o pérdida trófica que produce a escala colectiva planetaria."
                }
              }
            },
            alternativeReflection: {
              type: Type.STRING,
              description: "Una última e incisiva pregunta abierta formulada de forma socrática que rete directamente los cimientos morales del usuario sin acusar u ofender."
            }
          }
        }
      }
    });

    const textOutput = response.text?.trim();
    if (!textOutput) {
      throw new Error("No se obtuvo respuesta del motor de deconstrucción.");
    }

    const payload = JSON.parse(textOutput);
    res.json(payload);
  } catch (err: any) {
    console.error("Gemini Error:", err);
    res.status(500).json({ error: err?.message || "Algo salió mal procesando tu argumento con la Inteligencia de Sintiens." });
  }
});

async function startServer() {
  // Vite / static middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();


