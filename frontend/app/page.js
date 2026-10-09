"use client";

import { useState } from "react";

const API_URL = process.env.API_URL || "https://gopratle-vt95.onrender.com/api";

export default function Home() {

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
   
    eventName: "",
    eventType: "wedding",
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
    category: "planner",


    expectedGuests: "",
    planningSupport: "full",
    servicesNeeded: ["full-planning"],
    plannerBudgetMin: "",
    plannerBudgetMax: "",
    plannerNotes: "",


    performerType: "singer",
    performanceDurationMinutes: 60,
    numberOfPerformers: 1,
    genres: "Bollywood, Acoustic",
    performerBudgetMin: "",
    performerBudgetMax: "",
    soundSystemProvided: false,
    stageProvided: false,
    performerNotes: "",

    crewRole: "security",
    crewCount: 2,
    shiftHoursPerDay: 8,
    payPerPersonPerDay: "",
    mealsProvided: true,
    transportProvided: false,
    accommodationProvided: false,
    crewNotes: "",
  });


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleServiceToggle = (service) => {
    const current = formData.servicesNeeded;
    if (current.includes(service)) {
      setFormData({
        ...formData,
        servicesNeeded: current.filter((s) => s !== service),
      });
    } else {
      setFormData({
        ...formData,
        servicesNeeded: [...current, service],
      });
    }
  };

  const handleNext = () => {
    setErrorMessage("");


    if (step === 1) {
      if (!formData.eventName.trim()) {
        setErrorMessage("Please enter an event name.");
        return;
      }
      if (!formData.startDate) {
        setErrorMessage("Please select a start date.");
        return;
      }
      if (formData.endDate && formData.endDate < formData.startDate) {
        setErrorMessage("End date cannot be before start date.");
        return;
      }
      if (!formData.location.trim()) {
        setErrorMessage("Please enter an event location.");
        return;
      }
    }

    if (step === 2) {
      if (formData.category === "planner") {
        if (!formData.expectedGuests || Number(formData.expectedGuests) < 1) {
          setErrorMessage("Please enter expected guests (at least 1).");
          return;
        }
        if (formData.servicesNeeded.length === 0) {
          setErrorMessage("Please select at least one service needed.");
          return;
        }
      }
      if (formData.category === "performer") {
        if (!formData.performanceDurationMinutes || Number(formData.performanceDurationMinutes) < 5) {
          setErrorMessage("Performance duration must be at least 5 minutes.");
          return;
        }
      }
      if (formData.category === "crew") {
        if (!formData.crewCount || Number(formData.crewCount) < 1) {
          setErrorMessage("Crew count must be at least 1.");
          return;
        }
        if (!formData.shiftHoursPerDay || Number(formData.shiftHoursPerDay) < 1) {
          setErrorMessage("Shift hours must be at least 1.");
          return;
        }
      }
    }

    if (step === 3) {
      if (formData.category === "planner") {
        if (!formData.plannerBudgetMin || !formData.plannerBudgetMax) {
          setErrorMessage("Please enter both minimum and maximum budget.");
          return;
        }
        if (Number(formData.plannerBudgetMax) < Number(formData.plannerBudgetMin)) {
          setErrorMessage("Maximum budget cannot be less than minimum budget.");
          return;
        }
      }
      if (formData.category === "performer") {
        if (!formData.performerBudgetMin || !formData.performerBudgetMax) {
          setErrorMessage("Please enter both minimum and maximum budget.");
          return;
        }
        if (Number(formData.performerBudgetMax) < Number(formData.performerBudgetMin)) {
          setErrorMessage("Maximum budget cannot be less than minimum budget.");
          return;
        }
      }
      if (formData.category === "crew") {
        if (!formData.payPerPersonPerDay) {
          setErrorMessage("Please enter pay per person per day.");
          return;
        }
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setErrorMessage("");
    setStep(step - 1);
  };


  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage("");

    let details = {};

    if (formData.category === "planner") {
      details = {
        expectedGuests: Number(formData.expectedGuests),
        servicesNeeded: formData.servicesNeeded,
        budgetMin: Number(formData.plannerBudgetMin),
        budgetMax: Number(formData.plannerBudgetMax),
        planningSupport: formData.planningSupport,
        notes: formData.plannerNotes,
      };
    } else if (formData.category === "performer") {
      details = {
        performerType: formData.performerType,
        genres: formData.genres.split(",").map((g) => g.trim()).filter(Boolean),
        performanceDurationMinutes: Number(formData.performanceDurationMinutes),
        numberOfPerformers: Number(formData.numberOfPerformers),
        budgetMin: Number(formData.performerBudgetMin),
        budgetMax: Number(formData.performerBudgetMax),
        soundSystemProvided: formData.soundSystemProvided,
        stageProvided: formData.stageProvided,
        notes: formData.performerNotes,
      };
    } else if (formData.category === "crew") {
      details = {
        roles: [{ role: formData.crewRole, count: Number(formData.crewCount) }],
        shiftHoursPerDay: Number(formData.shiftHoursPerDay),
        payPerPersonPerDay: Number(formData.payPerPersonPerDay),
        mealsProvided: formData.mealsProvided,
        transportProvided: formData.transportProvided,
        accommodationProvided: formData.accommodationProvided,
        notes: formData.crewNotes,
      };
    }

    const payload = {
      eventName: formData.eventName,
      eventType: formData.eventType,
      startDate: new Date(formData.startDate).toISOString(),
      ...(formData.endDate ? { endDate: new Date(formData.endDate).toISOString() } : {}),
      location: formData.location,
      ...(formData.venue ? { venue: formData.venue } : {}),
      category: formData.category,
      details: details,
    };

    try {
      const res = await fetch(`${API_URL}/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setStep(5); 
      } else {
        let msg = data.message || "Submission failed";
        if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
          msg = data.errors.map((e) => e.message).join(" • ");
        }
        setErrorMessage(msg);
      }
    } catch (err) {
      setErrorMessage("Could not connect to backend server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      ...formData,
      eventName: "",
      startDate: "",
      endDate: "",
      location: "",
      venue: "",
    });
    setStep(1);
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">GoPratle Requirement Form</h1>
          <p className="text-sm text-slate-500">Post your event requirements in 4 simple steps</p>
        </div>

        {step <= 4 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
              <span className={step >= 1 ? "text-blue-600" : ""}>1. Event Basics</span>
              <span className={step >= 2 ? "text-blue-600" : ""}>2. Details</span>
              <span className={step >= 3 ? "text-blue-600" : ""}>3. Budget</span>
              <span className={step >= 4 ? "text-blue-600" : ""}>4. Review</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMessage}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Step 1: Event Basics</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Event Name *</label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                placeholder="e.g. Annual College Fest"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Event Type</label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                >
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate</option>
                  <option value="concert">Concert</option>
                  <option value="festival">Festival</option>
                  <option value="birthday">Birthday</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">City / Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Bengaluru"
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date *</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Venue (Optional)</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="e.g. Main Auditorium"
                className="w-full p-2 border border-slate-300 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "planner", label: "Event Planner" },
                  { value: "performer", label: "Performer" },
                  { value: "crew", label: "Event Crew" },
                ].map((item) => (
                  <label
                    key={item.value}
                    className={`p-3 border rounded-lg text-center cursor-pointer text-sm font-medium ${
                      formData.category === item.value
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={item.value}
                      checked={formData.category === item.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 capitalize">
              Step 2: {formData.category} Details
            </h2>

            {formData.category === "planner" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Guests *</label>
                    <input
                      type="number"
                      name="expectedGuests"
                      value={formData.expectedGuests}
                      onChange={handleChange}
                      placeholder="e.g. 200"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Planning Support</label>
                    <select
                      name="planningSupport"
                      value={formData.planningSupport}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="full">Full Planning</option>
                      <option value="partial">Partial Planning</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Services Needed *</label>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { id: "full-planning", label: "Full Planning" },
                      { id: "decor", label: "Decor" },
                      { id: "catering", label: "Catering" },
                      { id: "guest-management", label: "Guest Management" },
                    ].map((srv) => (
                      <label key={srv.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.servicesNeeded.includes(srv.id)}
                          onChange={() => handleServiceToggle(srv.id)}
                        />
                        {srv.label}
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            {formData.category === "performer" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Performer Type</label>
                    <select
                      name="performerType"
                      value={formData.performerType}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="singer">Singer</option>
                      <option value="dj">DJ</option>
                      <option value="band">Band</option>
                      <option value="dancer">Dancer</option>
                      <option value="comedian">Comedian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of Performers</label>
                    <input
                      type="number"
                      name="numberOfPerformers"
                      value={formData.numberOfPerformers}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    name="performanceDurationMinutes"
                    value={formData.performanceDurationMinutes}
                    onChange={handleChange}
                    placeholder="e.g. 60"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Genres (comma separated)</label>
                  <input
                    type="text"
                    name="genres"
                    value={formData.genres}
                    onChange={handleChange}
                    placeholder="e.g. Bollywood, Pop, Rock"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}

            {formData.category === "crew" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Crew Role</label>
                    <select
                      name="crewRole"
                      value={formData.crewRole}
                      onChange={handleChange}
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white"
                    >
                      <option value="security">Security</option>
                      <option value="sound">Sound Tech</option>
                      <option value="lighting">Lighting</option>
                      <option value="photographer">Photographer</option>
                      <option value="videographer">Videographer</option>
                      <option value="catering-staff">Catering Staff</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Number of People *</label>
                    <input
                      type="number"
                      name="crewCount"
                      value={formData.crewCount}
                      onChange={handleChange}
                      min="1"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Shift Hours Per Day *</label>
                  <input
                    type="number"
                    name="shiftHoursPerDay"
                    value={formData.shiftHoursPerDay}
                    onChange={handleChange}
                    min="1"
                    max="24"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Step 3: Budget & Logistics</h2>

            {formData.category === "planner" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Budget (₹) *</label>
                    <input
                      type="number"
                      name="plannerBudgetMin"
                      value={formData.plannerBudgetMin}
                      onChange={handleChange}
                      placeholder="e.g. 50000"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Maximum Budget (₹) *</label>
                    <input
                      type="number"
                      name="plannerBudgetMax"
                      value={formData.plannerBudgetMax}
                      onChange={handleChange}
                      placeholder="e.g. 100000"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    name="plannerNotes"
                    value={formData.plannerNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>
              </>
            )}
            {formData.category === "performer" && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Budget (₹) *</label>
                    <input
                      type="number"
                      name="performerBudgetMin"
                      value={formData.performerBudgetMin}
                      onChange={handleChange}
                      placeholder="e.g. 30000"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Maximum Budget (₹) *</label>
                    <input
                      type="number"
                      name="performerBudgetMax"
                      value={formData.performerBudgetMax}
                      onChange={handleChange}
                      placeholder="e.g. 60000"
                      className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="soundSystemProvided"
                      checked={formData.soundSystemProvided}
                      onChange={handleChange}
                    />
                    Sound system provided by organizer
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="stageProvided"
                      checked={formData.stageProvided}
                      onChange={handleChange}
                    />
                    Stage provided by organizer
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    name="performerNotes"
                    value={formData.performerNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>
              </>
            )}

            {formData.category === "crew" && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Daily Pay Per Person (₹) *</label>
                  <input
                    type="number"
                    name="payPerPersonPerDay"
                    value={formData.payPerPersonPerDay}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="mealsProvided"
                      checked={formData.mealsProvided}
                      onChange={handleChange}
                    />
                    Meals provided
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="transportProvided"
                      checked={formData.transportProvided}
                      onChange={handleChange}
                    />
                    Transport provided
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      name="accommodationProvided"
                      checked={formData.accommodationProvided}
                      onChange={handleChange}
                    />
                    Accommodation provided
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    name="crewNotes"
                    value={formData.crewNotes}
                    onChange={handleChange}
                    rows="2"
                    className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                  ></textarea>
                </div>
              </>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Step 4: Review Details</h2>
            <p className="text-xs text-slate-500">Please review your information before submitting.</p>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2 text-sm border border-slate-200">
              <p><strong>Event:</strong> {formData.eventName} ({formData.eventType})</p>
              <p><strong>Location:</strong> {formData.location} {formData.venue ? `- ${formData.venue}` : ""}</p>
              <p><strong>Start Date:</strong> {formData.startDate}</p>
              <p><strong>Category:</strong> <span className="capitalize font-semibold text-blue-600">{formData.category}</span></p>

              {formData.category === "planner" && (
                <>
                  <p><strong>Expected Guests:</strong> {formData.expectedGuests}</p>
                  <p><strong>Services:</strong> {formData.servicesNeeded.join(", ")}</p>
                  <p><strong>Budget:</strong> ₹{formData.plannerBudgetMin} - ₹{formData.plannerBudgetMax}</p>
                </>
              )}

              {formData.category === "performer" && (
                <>
                  <p><strong>Performer:</strong> {formData.performerType} ({formData.numberOfPerformers} pax)</p>
                  <p><strong>Duration:</strong> {formData.performanceDurationMinutes} mins</p>
                  <p><strong>Budget:</strong> ₹{formData.performerBudgetMin} - ₹{formData.performerBudgetMax}</p>
                </>
              )}

              {formData.category === "crew" && (
                <>
                  <p><strong>Role:</strong> {formData.crewRole} ({formData.crewCount} people)</p>
                  <p><strong>Shift:</strong> {formData.shiftHoursPerDay} hours</p>
                  <p><strong>Daily Pay:</strong> ₹{formData.payPerPersonPerDay} / person</p>
                </>
              )}
            </div>
          </div>
        )}
        {step === 5 && (
          <div className="text-center py-6 space-y-3">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-800">Requirement Submitted Successfully!</h2>
            <p className="text-sm text-slate-600">
              Your event requirement has been posted successfully.
            </p>

            <button
              onClick={handleReset}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Post Another Requirement
            </button>
          </div>
        )}
        {step <= 4 && (
          <div className="flex justify-between mt-6 pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Requirement"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
