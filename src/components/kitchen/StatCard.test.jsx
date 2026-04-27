import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import StatCard from "./StatCard";
import { Activity } from "lucide-react"; 

describe("StatCard Component", () => {

  it("renders the title and value correctly", () => {
    render(
      <StatCard 
        title="Total Orders" 
        value="25" 
        icon={<Activity data-testid="test-icon" />} 
        iconBgColor="bg-blue-50" 
      />
    );

    expect(screen.getByText("Total Orders")).toBeInTheDocument();
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("renders the provided icon", () => {
    render(
      <StatCard 
        title="Stats" 
        value="10" 
        icon={<Activity data-testid="test-icon" />} 
      />
    );

    const icon = screen.getByTestId("test-icon");
    expect(icon).toBeInTheDocument();
  });

  it("applies the correct background color class to the icon container", () => {
    const bgColor = "bg-orange-100";
    
    render(
      <StatCard 
        title="Pending" 
        value="5" 
        icon={<Activity />} 
        iconBgColor={bgColor} 
      />
    );

    const iconContainer = screen.getByText("Pending").closest('div').parentElement.querySelector(`.${bgColor}`);
    
    expect(iconContainer).toHaveClass(bgColor);
  });
});