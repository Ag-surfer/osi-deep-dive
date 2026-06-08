import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Quiz, type QuizQuestion } from "./Quiz";

const questions: QuizQuestion[] = [
  {
    q: "Which layer routes packets between networks?",
    options: ["Data Link", "Network", "Transport"],
    answer: 1,
    explanation: "The Network layer (L3) provides logical addressing and routing.",
  },
];

describe("Quiz", () => {
  it("renders the question and options", () => {
    render(<Quiz questions={questions} />);
    expect(screen.getByText(/routes packets between networks/i)).toBeInTheDocument();
    expect(screen.getByText("Network")).toBeInTheDocument();
  });

  it("reveals correct feedback and explanation after picking the right answer", () => {
    render(<Quiz questions={questions} />);
    fireEvent.click(screen.getByText("Network"));
    expect(screen.getByText(/^Correct!/)).toBeInTheDocument();
    expect(screen.getByText(/logical addressing and routing/i)).toBeInTheDocument();
  });

  it("shows 'Not quite' when the wrong answer is chosen", () => {
    render(<Quiz questions={questions} />);
    fireEvent.click(screen.getByText("Data Link"));
    expect(screen.getByText(/Not quite/i)).toBeInTheDocument();
  });

  it("can be reset to answer again", () => {
    render(<Quiz questions={questions} />);
    fireEvent.click(screen.getByText("Data Link"));
    fireEvent.click(screen.getByText(/Reset/i));
    // After reset, feedback disappears and options are enabled again.
    expect(screen.queryByText(/Not quite/i)).not.toBeInTheDocument();
  });
});
