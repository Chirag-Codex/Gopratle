const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const eventTypes = ["wedding", "corporate", "concert", "festival", "birthday", "other"];
const plannerServices = [  "decor", "catering", "guest-management", "full-planning"];
const planningSupportTypes = ["full", "partial"];
const performerTypes = ["singer", "dj", "band", "dancer", "comedian"];
const crewRoles = ["sound", "lighting", "security", "photographer", "videographer", "catering-staff"];


const requirementSchema = new Schema(
  {
    eventName: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
      minlength: [3, "Event name must be at least 3 characters"],
      maxlength: [120, "Event name is too long"],
    },
    eventType: {
      type: String,
      required: [true, "Event type is required"],
      enum: { values: eventTypes, message: "{VALUE} is not a valid event type" },
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (value) {
          if (!value || !this.startDate) return true;
          return value >= this.startDate;
        },
        message: "End date cannot be before start date",
      },
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [150, "Location is too long"],
    },
    venue: {
      type: String,
      trim: true,
      maxlength: [150, "Venue is too long"],
    },
  },
  { timestamps: true, discriminatorKey: "category" }
);

const Requirement = mongoose.model("Requirement", requirementSchema);


const plannerDetailsSchema = new Schema(
  {
    expectedGuests: {
      type: Number,
      required: [true, "Expected guests is required"],
      min: [1, "Expected guests must be at least 1"],
    },
    servicesNeeded: {
      type: [{ type: String, enum: { values: plannerServices, message: "{VALUE} is not a valid service" } }],
      validate: [
        function (value) {
          return value.length > 0;
        },
        "Select at least one service",
      ],
    },
    budgetMin: {
      type: Number,
      required: [true, "Minimum budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    budgetMax: {
      type: Number,
      required: [true, "Maximum budget is required"],
      min: [0, "Budget cannot be negative"],
      validate: {
        validator: function (value) {
          if (this.budgetMin === undefined) return true;
          return value >= this.budgetMin;
        },
        message: "Maximum budget cannot be less than minimum budget",
      },
    },
    planningSupport: {
      type: String,
      required: [true, "Planning support is required"],
      enum: { values: planningSupportTypes, message: "{VALUE} is not a valid planning support type" },
    },
    minExperienceYears: { type: Number, min: 0, default: 0 },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const Planner = Requirement.discriminator(
  "Planner",
  new Schema({
    details: { type: plannerDetailsSchema, required: [true, "Planner details are required"] },
  }),
  "planner"
);


const performerDetailsSchema = new Schema(
  {
    performerType: {
      type: String,
      required: [true, "Performer type is required"],
      enum: { values: performerTypes, message: "{VALUE} is not a valid performer type" },
    },
    genres: [{ type: String, trim: true }],
    performanceDurationMinutes: {
      type: Number,
      required: [true, "Performance duration is required"],
      min: [5, "Duration must be at least 5 minutes"],
    },
    numberOfPerformers: { type: Number, min: 1, default: 1 },
    budgetMin: {
      type: Number,
      required: [true, "Minimum budget is required"],
      min: [0, "Budget cannot be negative"],
    },
    budgetMax: {
      type: Number,
      required: [true, "Maximum budget is required"],
      min: [0, "Budget cannot be negative"],
      validate: {
        validator: function (value) {
          if (this.budgetMin === undefined) return true;
          return value >= this.budgetMin;
        },
        message: "Maximum budget cannot be less than minimum budget",
      },
    },
    soundSystemProvided: { type: Boolean, default: false },
    stageProvided: { type: Boolean, default: false },
    auditionRequired: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const Performer = Requirement.discriminator(
  "Performer",
  new Schema({
    details: { type: performerDetailsSchema, required: [true, "Performer details are required"] },
  }),
  "performer"
);


const crewRoleSchema = new Schema(
  {
    role: {
      type: String,
      required: [true, "Crew role is required"],
      enum: { values: crewRoles, message: "{VALUE} is not a valid crew role" },
    },
    count: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "Count must be at least 1"],
    },
  },
  { _id: false }
);

const crewDetailsSchema = new Schema(
  {
    roles: {
      type: [crewRoleSchema],
      validate: [
        function (value) {
          return value.length > 0;
        },
        "Select at least one crew role",
      ],
    },
    minExperienceYears: { type: Number, min: 0, default: 0 },
    shiftHoursPerDay: {
      type: Number,
      required: [true, "Shift hours per day is required"],
      min: [1, "Shift must be at least 1 hour"],
      max: [24, "Shift cannot be more than 24 hours"],
    },
    payPerPersonPerDay: {
      type: Number,
      required: [true, "Pay per person per day is required"],
      min: [0, "Pay cannot be negative"],
    },
    accommodationProvided: { type: Boolean, default: false },
    transportProvided: { type: Boolean, default: false },
    mealsProvided: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
);

const Crew = Requirement.discriminator(
  "Crew",
  new Schema({
    details: { type: crewDetailsSchema, required: [true, "Crew details are required"] },
  }),
  "crew"
);

const CategoryModels = {
  planner: Planner,
  performer: Performer,
  crew: Crew,
};

module.exports = { Requirement, CategoryModels };