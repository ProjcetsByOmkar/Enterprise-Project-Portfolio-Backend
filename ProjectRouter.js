const express = require("express");
const Project = require("./model");
const cors = require("cors");

const router = express.Router();
router.use(cors());
router.use(express.json());

router.post("/postprojects", async (req, res) => {
  console.log("Received request to create project:", req.body);

  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({ error: "Invalid request data" });
  }

  const {
    name,
    reason,
    type,
    div,
    category,
    priority,
    helpDeskLocation,
    projectLocation,
    startDate,
    endDate,
  } = req.body;

  const requiredFields = [
    name,
    reason,
    type,
    category,
    priority,
    helpDeskLocation,
    projectLocation,
    startDate,
    endDate,
  ];

  if (requiredFields.some((field) => !field)) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) {
    return res
      .status(400)
      .json({ error: "End date cannot be earlier than start date." });
  }

  try {
    const newProject = new Project({
      name,
      reason,
      type,
      div,
      category,
      priority,
      helpDeskLocation,
      projectLocation,
      status: "Registered",
      startDate: start,
      endDate: end,
    });

    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: error.message || "Error creating project" });
  }
});

router.get("/getprojects", async (req, res) => {
  try {
    const projects = await Project.find({});
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

router.put("/putprojects/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project", error });
  }
});

router.get("/getCounters", async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({});
    const closedProjects = await Project.countDocuments({ status: "Closed" });
    const runningProjects = await Project.countDocuments({ status: "Running" });
    const closureDelayedProjects = await Project.countDocuments({
      status: "Closure Delayed",
    });
    const cancelledProjects = await Project.countDocuments({
      status: "Cancelled",
    });

    res.json({
      totalProjects,
      closedProjects,
      runningProjects,
      closureDelayedProjects,
      cancelledProjects,
    });
  } catch (error) {
    console.error("Error fetching project counters:", error);
    res.status(500).json({ message: "Error fetching project counters", error });
  }
});

router.get("/getRecentProjects", async (req, res) => {
  try {
    const recentProjects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(5);
    res.json(recentProjects);
  } catch (error) {
    console.error("Error fetching recent projects:", error);
    res.status(500).json({ message: "Error fetching recent projects", error });
  }
});

router.get("/getDepartmentStats", async (req, res) => {
  try {
    const departmentStats = await Project.aggregate([
      {
        $group: {
          _id: "$div",
          totalProjects: { $sum: 1 },
          closedProjects: {
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] },
          },
        },
      },
    ]);

    res.json(departmentStats);
  } catch (error) {
    console.error("Error fetching department statistics:", error);
    res
      .status(500)
      .json({ message: "Error fetching department statistics", error });
  }
});

module.exports = router;
