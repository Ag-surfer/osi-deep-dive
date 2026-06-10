import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlossaryList } from "./GlossaryList";
import { GLOSSARY } from "@/lib/glossary";

describe("GlossaryList", () => {
  it("renders every term by default", () => {
    render(<GlossaryList />);
    expect(screen.getByText(`${GLOSSARY.length} terms`)).toBeInTheDocument();
  });

  it("filters by search text across term and definition", () => {
    render(<GlossaryList />);
    fireEvent.change(screen.getByLabelText(/search glossary/i), { target: { value: "ARP" } });
    expect(screen.getByText("ARP")).toBeInTheDocument();
    // EtherType matches only via its definition text ("0x0806 = ARP") —
    // proves the search looks at definitions, not just term names.
    expect(screen.getByText("EtherType")).toBeInTheDocument();
    const shown = GLOSSARY.filter(
      (e) => e.term.toLowerCase().includes("arp") || e.def.toLowerCase().includes("arp"),
    );
    expect(screen.getByText(new RegExp(`^${shown.length} terms?$`))).toBeInTheDocument();
  });

  it("filters by layer chip and combines it with search", () => {
    render(<GlossaryList />);
    fireEvent.click(screen.getByRole("button", { name: "L4" }));
    const l4 = GLOSSARY.filter((e) => e.layer === 4);
    expect(screen.getByText(new RegExp(`^${l4.length} terms?$`))).toBeInTheDocument();
    expect(screen.getByText("ACK")).toBeInTheDocument();
    // L2-only term hidden under the L4 filter.
    expect(screen.queryByText("ARP")).not.toBeInTheDocument();
    // Chip is exposed as a toggle.
    expect(screen.getByRole("button", { name: "L4" })).toHaveAttribute("aria-pressed", "true");
    // "All" restores the full list.
    fireEvent.click(screen.getByRole("button", { name: "All" }));
    expect(screen.getByText(`${GLOSSARY.length} terms`)).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", () => {
    render(<GlossaryList />);
    fireEvent.change(screen.getByLabelText(/search glossary/i), {
      target: { value: "zzz-no-such-term" },
    });
    expect(screen.getByText(/No terms match/)).toBeInTheDocument();
  });
});
