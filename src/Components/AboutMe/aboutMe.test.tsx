import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("../../assets/SelfPortrait.jpg", () => ({ default: "SelfPortrait.jpg" }));
vi.mock("../../assets/github-light.svg", () => ({ default: "github.svg" }));
vi.mock("../../assets/linkedin.svg", () => ({ default: "linkedin.svg" }));

import AboutMe from "./aboutMe";

describe("AboutMe", () => {
  it("renders name heading in hero zone", () => {
    render(<AboutMe />);
    expect(screen.getByRole("heading", { name: /brandon bashein/i })).toBeInTheDocument();
  });

  it("renders role subtitle in hero zone", () => {
    render(<AboutMe />);
    const container = screen.getByRole("heading", { name: /brandon bashein/i }).closest(".heroZone");
    expect(container?.querySelector(".heroRole")).not.toBeEmptyDOMElement();
  });

  it("renders GitHub social pill", () => {
    render(<AboutMe />);
    const link = screen.getByRole("link", { name: /github/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("github"));
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders LinkedIn social pill", () => {
    render(<AboutMe />);
    const link = screen.getByRole("link", { name: /linkedin/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("linkedin"));
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders About the site section label", () => {
    render(<AboutMe />);
    expect(screen.getByText(/about the site/i)).toBeInTheDocument();
  });

  it("renders Baking & background section label", () => {
    render(<AboutMe />);
    expect(screen.getByText(/baking & background/i)).toBeInTheDocument();
  });

  it("renders CV download link", () => {
    render(<AboutMe />);
    const link = screen.getByRole("link", { name: /download cv/i });
    expect(link).toHaveAttribute("href", "/static/Brandon_Bashein_CV.pdf");
    expect(link).toHaveAttribute("download");
  });
});
