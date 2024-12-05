const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    reason: { type: String, required: true }, //division
    type: { type: String, required: true },
    div: { type: String, required: true },
    category: { type: String, required: true },
    priority: { type: String, required: true },
    helpDeskLocation: { type: String, required: true }, //department
    projectLocation: { type: String, required: true },
    status: { type: String, default: "Registered" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;
