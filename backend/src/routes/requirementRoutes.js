const express = require("express");
const router = express.Router();

const {
  createRequirement,
  getRequirements,
  getRequirementById,
} = require("../controllers/requirementController");


router.post("/", createRequirement);

router.get("/", getRequirements);

router.get("/:id", getRequirementById);

module.exports = router;

