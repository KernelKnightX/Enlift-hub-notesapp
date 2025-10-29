import Image from "next/image";
import React from "react";

export default function ProfileDisplay({ user, editMode }) {
  const {
    fullName,
    gender,
    dob,
    mobile,
    email,
    city,
    district,
    state,
    pincode,
    exam,
    attemptYear,
    medium,
    qualification,
    discipline,
    college,
    coaching,
    coachingName,
  } = user || {};

  const renderField = (label, value, name, placeholder = "") => (
    <p className="py-3 border-bottom mb-0 d-flex align-items-center justify-content-between">
      <span>{label}</span>
      {editMode ? (
        <input
          type="text"
          className="form-control form-control-sm w-65 text-end"
          name={name}
          defaultValue={value}
          placeholder={placeholder}
        />
      ) : (
        <span className="text-end">{value || "—"}</span>
      )}
    </p>
  );

  const renderSelectField = (label, value, name, options = []) => (
    <p className="py-3 border-bottom mb-0 d-flex align-items-center justify-content-between">
      <span>{label}</span>
      {editMode ? (
        <select
          className="form-select form-select-sm w-65 text-end"
          name={name}
          defaultValue={value || ""}
        >
          <option value="" disabled>Select {label.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-end">{value || "—"}</span>
      )}
    </p>
  );

  return (
    <div className="row g-4">
      <div className="col-md-4">
        <div className="card shadow-sm">
          <div className="card-header d-flex align-items-center justify-content-center p-5 position-relative">
            <div className="bg-white border btn-profile-photo">
              <Image
                src="/images/student-image.png"
                className="img-fluid rounded-circle p-3"
                width={135}
                height={135}
                alt="Student"
              />
              <button className="hover-overlay-dark">
                <h4 className="mb-0"><i className="bi bi-arrow-repeat" /></h4>
                <small>Change Photo</small>
              </button>
            </div>
          </div>
          <div className="card-body pt-1 small">
            {renderField("Full Name", fullName, "fullName", "Enter your full name")}
            {renderSelectField("Gender", gender, "gender", ["Male", "Female", "Other"])}
            {renderField("Date of Birth", dob, "dob", "YYYY-MM-DD")}
            {renderField("Mobile", mobile, "mobile", "Enter mobile number")}
            {renderField("Email", email, "email", "Enter email address")}
          </div>
        </div>
      </div>

      <div className="col-md-8">
        {/* Address Details */}
        <div className="card shadow-sm mb-3">
          <div className="card-header fw-semibold">Address Details</div>
          <div className="card-body pt-1 small">
            {renderField("City", city, "city", "City / Town")}
            {renderField("District", district, "district", "District")}
            {renderField("State", state, "state", "State")}
            {renderField("Pincode", pincode, "pincode", "6-digit Pincode")}
          </div>
        </div>

        {/* Exam Info */}
        <div className="card shadow-sm mb-3">
          <div className="card-header fw-semibold">Exam Information</div>
          <div className="card-body pt-1 small">
            {renderField("Exam", exam, "exam", "e.g. UPSC CSE")}
            {renderField("Attempt Year", attemptYear, "attemptYear", "e.g. 2025")}
            {renderSelectField("Language Medium", medium, "medium", ["English", "Hindi", "Other"])}
          </div>
        </div>

        {/* Academic Info */}
        <div className="card shadow-sm mb-3">
          <div className="card-header fw-semibold">Academic & Coaching</div>
          <div className="card-body pt-1 small">
            {renderSelectField("Qualification", qualification, "qualification", [
              "High School",
              "Intermediate",
              "Graduation",
              "Post Graduation",
              "Other",
            ])}
            {renderField("Discipline", discipline, "discipline", "e.g. Political Science")}
            {renderField("College", college, "college", "Enter college name")}
            {renderField("Coaching", coaching, "coaching", "Yes / No")}
            {coaching === "Yes" && renderField("Coaching Name", coachingName, "coachingName", "Enter coaching name")}
          </div>
        </div>
      </div>
    </div>
  );
}