"use client";

import React from "react";
import { FormData } from "../data/formData";

interface SectionAProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
  errors: Record<string, string>;
}

export default function SectionA({ formData, onChange, errors }: SectionAProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div id="section-a-container">
      <h3 className="section-subtitle" style={{ fontSize: "1.35rem", marginBottom: "1.5rem" }}>
        Section A: Community Information
      </h3>
      <div className="form-grid">
        {/* Country Name */}
        <div className={`form-group ${errors.countryName ? "error" : ""}`}>
          <label className="form-label" htmlFor="countryName">
            Country Name <span className="required-dot">*</span>

          </label>
          <input
            type="text"
            id="countryName"
            name="countryName"
            value={formData.countryName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.countryName && <span className="form-error-msg">{errors.countryName}</span>}
        </div>

        {/* Catchment Area */}
        <div className={`form-group ${errors.catchmentArea ? "error" : ""}`}>
          <label className="form-label" htmlFor="catchmentArea">
            Catchment Area <span className="required-dot">*</span>

          </label>
          <input
            type="text"
            id="catchmentArea"
            name="catchmentArea"
            value={formData.catchmentArea}
            onChange={handleChange}
            className="form-input"
          />
          {errors.catchmentArea && <span className="form-error-msg">{errors.catchmentArea}</span>}
        </div>

        {/* Community Name */}
        <div className={`form-group ${errors.communityName ? "error" : ""}`}>
          <label className="form-label" htmlFor="communityName">
            Community Name <span className="required-dot">*</span>

          </label>
          <input
            type="text"
            id="communityName"
            name="communityName"
            value={formData.communityName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.communityName && <span className="form-error-msg">{errors.communityName}</span>}
        </div>

        {/* CMC */}
        <div className={`form-group ${errors.cmc ? "error" : ""}`}>
          <label className="form-label" htmlFor="cmc">
            NAME OF CMC <span className="required-dot">*</span>

          </label>
          <input
            type="text"
            id="cmc"
            name="cmc"
            value={formData.cmc}
            onChange={handleChange}
            className="form-input"
          />
          {errors.cmc && <span className="form-error-msg">{errors.cmc}</span>}
        </div>

        {/* Date Established */}
        <div className={`form-group ${errors.dateEstablished ? "error" : ""}`}>
          <label className="form-label" htmlFor="dateEstablished">
            Date Established <span className="required-dot">*</span>
          </label>
         <input
  type="date"
  id="dateEstablished"
  name="dateEstablished"
  value={formData.dateEstablished}
  onChange={handleChange}
  className="form-input"
  style={{
    minHeight: "52px",
    fontSize: "1rem",
    padding: "0.75rem 1rem"
  }}
/>
          {errors.dateEstablished && (
            <span className="form-error-msg">{errors.dateEstablished}</span>
          )}
        </div>

        {/* Number of Shalom Leaders */}
        <div className={`form-group ${errors.shalomLeadersCount ? "error" : ""}`}>
          <label className="form-label" htmlFor="shalomLeadersCount">
            Number of Shalom Leaders <span className="required-dot">*</span>
            <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
              (e.g. 5)
            </span>
          </label>
          <input
            type="number"
            id="shalomLeadersCount"
            name="shalomLeadersCount"
            value={formData.shalomLeadersCount}
            onChange={handleChange}
            min="0"
            className="form-input"
          />
          {errors.shalomLeadersCount && (
            <span className="form-error-msg">{errors.shalomLeadersCount}</span>
          )}
        </div>

        {/* Name of Community Leader Providing Information */}
        <div className={`form-group ${errors.leaderName ? "error" : ""}`}>
          <label className="form-label" htmlFor="leaderName">
            Leader Providing Info <span className="required-dot">*</span>
            <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--text-muted)", fontSize: "0.8rem", display: "block", marginTop: "0.2rem" }}>
              (Leader's Full Name)
            </span>
          </label>
          <input
            type="text"
            id="leaderName"
            name="leaderName"
            value={formData.leaderName}
            onChange={handleChange}
            className="form-input"
          />
          {errors.leaderName && <span className="form-error-msg">{errors.leaderName}</span>}
        </div>

        {/* Contact Information */}
        <div className={`form-group full-width ${errors.contactInfo ? "error" : ""}`}>
          <label className="form-label" htmlFor="contactInfo">
            Phone Number <span className="required-dot">*</span>
          </label>
          <input
            type="text"
            id="contactInfo"
            name="contactInfo"
            value={formData.contactInfo}
            onChange={handleChange}
            className="form-input"
          />
          {errors.contactInfo && <span className="form-error-msg">{errors.contactInfo}</span>}
        </div>
      </div>
    </div>
  );
}
