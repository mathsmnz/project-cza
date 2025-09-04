// src/app.ts
import express, { Express, Request, Response, NextFunction } from "express";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import fileRoutes from "./routes/file.routes.js";
import { structuredLogger } from "./middleware/logging.middleware.js";
import cors from 'cors'; 
import cookieParser from 'cookie-parser';

// --- CONFIGURAÇÃO DO CORS ---
const allowedOrigins = [
  'http://127.0.0.1:8000',
  'http://localhost:8000' // <-- Adicione esta linha
];

const corsOptions = {
  origin: (
    origin: string | undefined, 
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Permite requisições sem 'origin' ou se a origem estiver na lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Acesso não permitido pelo CORS'));
    }
  },
  credentials: true,
};

const app: Express = express();

// --- MIDDLEWARE ---
app.use(structuredLogger);
app.use(cors(corsOptions)); 
app.use(cookieParser());
app.use(express.json());

// --- ROTAS DA API ---
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/files", fileRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// --- MANIPULADOR PARA ROTAS NÃO ENCONTRADAS (404) ---
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error); 
});

// --- MANIPULADOR DE ERROS GLOBAL ---
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  console.error("🔴 Erro não tratado:", err.stack);

  res.status(statusCode).json({
    message: statusCode === 404 ? err.message : "Algo deu errado no servidor.",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
