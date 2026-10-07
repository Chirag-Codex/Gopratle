const { Requirement, CategoryModels } = require("../models/Requirement");


const createRequirement = async (req, res, next) => {
  try {
    const { category } = req.body;

    
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    
    if (category !== "planner" && category !== "performer" && category !== "crew") {
      return res.status(400).json({
        success: false,
        message: "Category must be planner, performer, or crew",
      });
    }

    const Model = CategoryModels[category];

    const requirementData = {
      eventName: req.body.eventName,
      eventType: req.body.eventType,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      location: req.body.location,
      venue: req.body.venue,
      category: req.body.category,
      details: req.body.details,
    };

    const newRequirement = new Model(requirementData);
    const savedData = await newRequirement.save();

    return res.status(201).json({
      success: true,
      message: "Requirement created successfully",
      data: savedData,
    });
  } catch (err) {
    next(err);
  }
};


const getRequirements = async (req, res, next) => {
  try {
    const category = req.query.category;
    let filter = {};

   
    if (category) {
      filter = { category: category };
    }

    const requirements = await Requirement.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Requirements fetched successfully",
      data: requirements,
    });
  } catch (err) {
    next(err);
  }
};

const getRequirementById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const requirement = await Requirement.findById(id);

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: "Requirement not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Requirement fetched successfully",
      data: requirement,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById,
};
