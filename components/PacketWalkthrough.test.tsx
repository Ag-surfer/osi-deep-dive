import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PacketWalkthrough } from "./PacketWalkthrough";
import { FRAMES } from "@/lib/capture";

/** The field-detail panel (role=status) — field names also appear in the index list. */
function panel() {
  return within(screen.getByRole("status"));
}

function byteButton(offset: number) {
  return screen.getByRole("button", { name: new RegExp(`^Byte ${offset}:`) });
}

describe("PacketWalkthrough", () => {
  it("shows the SYN frame first with one button per byte", () => {
    render(<PacketWalkthrough />);
    const syn = FRAMES[0]!;
    expect(syn.id).toBe("syn");
    const byteButtons = screen.getAllByRole("button", { name: /^Byte \d+:/ });
    expect(byteButtons).toHaveLength(syn.bytes.length);
    expect(screen.getByText(syn.summary)).toBeInTheDocument();
  });

  it("decodes the SYN's MSS option with its layer tag", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(byteButton(54));
    expect(panel().getByText("Option: MSS")).toBeInTheDocument();
    expect(panel().getByText(/MSS 1460/)).toBeInTheDocument();
    expect(panel().getByText(/L4 Transport/)).toBeInTheDocument();
  });

  it("switching frames re-renders the bytes and clears the selection", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(byteButton(22)); // TTL selected on SYN
    expect(panel().getByText("TTL")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /4 · HTTP 200/ }));
    // Selection cleared, frame swapped to the 150-byte response.
    expect(panel().queryByText("TTL")).not.toBeInTheDocument();
    const resp = FRAMES.find((f) => f.id === "response")!;
    expect(screen.getAllByRole("button", { name: /^Byte \d+:/ })).toHaveLength(resp.bytes.length);
    expect(screen.getByRole("button", { name: /4 · HTTP 200/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("decodes the response's acknowledgment of the 74-byte GET", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /4 · HTTP 200/ }));
    fireEvent.click(byteButton(42)); // Acknowledgment Number
    expect(panel().getByText("Acknowledgment Number")).toBeInTheDocument();
    expect(panel().getByText(/74 payload bytes of the GET/)).toBeInTheDocument();
  });

  it("shows readable HTML in the response payload", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /4 · HTTP 200/ }));
    fireEvent.click(byteButton(118));
    expect(panel().getByText("Body (HTML)")).toBeInTheDocument();
    expect(panel().getByText(/L7 Application/)).toBeInTheDocument();
  });

  it("every byte of a selected multi-byte field is marked pressed", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(byteButton(26)); // Source IP, bytes 26–29
    for (const offset of [26, 27, 28, 29]) {
      expect(byteButton(offset)).toHaveAttribute("aria-pressed", "true");
    }
    expect(byteButton(30)).toHaveAttribute("aria-pressed", "false");
  });

  it("the layer legend jumps to that layer's first field", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /^L4 TCP header/ }));
    expect(panel().getByText("Source Port")).toBeInTheDocument();
    expect(panel().getByText(/51000/)).toBeInTheDocument();
  });
});
