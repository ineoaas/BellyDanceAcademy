import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderRoutes } from "@/test/render";
import { CourseCard } from "./CourseCard";

const course = {
  id: 1,
  slug: "drum-solo",
  title: "Drum Solo Choreography",
  instructorName: "Dalia Rostam",
  level: "ADVANCED",
  priceCents: 11000,
  description: "Sharp accents.",
  durationLabel: "7h 05m",
  lessonCount: 1,
  averageRating: null,
  reviewCount: 0,
};

describe("CourseCard", () => {
  it("shows price, level and a link to the course", () => {
    renderRoutes([{ path: "/", element: <CourseCard course={course} /> }]);

    expect(screen.getByRole("link")).toHaveAttribute("href", "/courses/drum-solo");
    expect(screen.getByText("$110")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();
    expect(screen.getByText("1 lesson")).toBeInTheDocument();
    expect(screen.getByText("No reviews yet")).toBeInTheDocument();
  });

  it("shows the rating once there are reviews", () => {
    renderRoutes([
      { path: "/", element: <CourseCard course={{ ...course, averageRating: 4.4, reviewCount: 3 }} /> },
    ]);

    expect(screen.getByLabelText("Rated 4.4 out of 5")).toHaveTextContent("★★★★☆");
  });
});
