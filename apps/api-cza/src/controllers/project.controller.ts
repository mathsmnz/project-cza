// src/controllers/project.controller.ts
import { Request, Response } from "express";
import Project from "../models/project.model.js";
import User from "../models/user.model.js";

// --- Create a new Project ---
export const createProject = async (req: Request, res: Response) => {
  try {
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

// --- Get all Projects ---
export const getAllProjects = async (req: Request, res: Response) => {
  try {
    // .populate() will replace the user IDs with the full user documents
    const projects = await Project.find().populate("users");
    res.status(200).json(projects);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// --- Get a single Project by ID ---
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("users")
      .populate("images")
      .populate("ifcs");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

// --- Update a Project by ID ---
export const updateProject = async (req: Request, res: Response) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Options to return the new version and run schema validation
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export const assignUserToProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message:
          "O ID do usuário (userId) é obrigatório no corpo da requisição.",
      });
    }

    const project = await Project.findById(projectId);
    const user = await User.findById(userId);

    if (!project) {
      return res.status(404).json({ message: "Projeto não encontrado." });
    }
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    await Project.findByIdAndUpdate(projectId, {
      $addToSet: { users: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { projects: projectId },
    });
  } catch (error){
    if (error instanceof Error) {
      res.status(500).json({ message: `Erro ao atribuir usuário ao projeto: ${error.message}` });
    }
  }
};

// --- Delete a Project by ID ---
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(204).send(); // 204 No Content is standard for a successful deletion
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    }
  }
};

export const seedProjects = async (req: Request, res: Response) => {
  try {
    const templateProjects = [
      {
        name: "Alpha Residential Tower",
        id: "TEMPLATE-ALPHA-001",
        customizations: [
          {
            id: "9303a397445c38e3134446ab333e39790e0ecaced66bdff33a9280bbf1bdad7a",
            label: "A",
            description: "AUMENTAR SALA/COZINHA\tPARA A FRENTE\n",
            relatedCombos: ["cozinhaFrente"],
            relatedGroups: ["A"],
          },
        ],
      },
      {
        name: "Beta Commercial Complex",
        id: "TEMPLATE-BETA-002",
        customizations: [],
      },
      {
        name: "Gamma Bridge Project",
        id: "TEMPLATE-GAMMA-003",
        customizations: [
          {
            id: "df6de903a9d8ce7aaa63193636eeeec86a0da33dc8614a927e94e78522d30edd",
            label: "G",
            description: "ADICIONAR CÔMODO PARA A FRENTE\n",
            relatedCombos: ["acrescentarComodoFrente"],
            relatedGroups: ["C"],
          },
        ],
      },
    ];

    //Remove existing template projects to avoid duplicates on re-seeding
    await Project.deleteMany({
      id: { $in: templateProjects.map((p) => p.id) },
    });

    // Insert the new template projects into the database
    const createdProjects = await Project.insertMany(templateProjects);

    res.status(201).json({
      message: `${createdProjects.length} template projects seeded successfully.`,
      projects: createdProjects,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: `Seeding failed: ${error.message}` });
    }
  }
};
