import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { PacketWalkthrough } from "./PacketWalkthrough";
import { FRAME } from "@/lib/capture";

/** The field-detail panel (role=status) — field names also appear in the index list. */
function panel() {
  return within(screen.getByRole("status"));
}

describe("PacketWalkthrough", () => {
  it("renders one button per frame byte", () => {
    render(<PacketWalkthrough />);
    const byteButtons = screen.getAllByRole("button", { name: /^Byte \d+:/ });
    expect(byteButtons).toHaveLength(FRAME.length);
  });

  it("starts with the click-to-decode prompt", () => {
    render(<PacketWalkthrough />);
    expect(screen.getByText(/Click any byte/)).toBeInTheDocument();
  });

  it("clicking the TTL byte decodes it with its layer tag", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /^Byte 22:/ }));
    expect(panel().getByText("TTL")).toBeInTheDocument();
    expect(panel().getByText("0x40 = 64")).toBeInTheDocument();
    expect(panel().getByText(/L3 Network/)).toBeInTheDocument();
  });

  it("clicking a payload byte shows the HTTP request line", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /^Byte 54:/ }));
    expect(panel().getByText("Request line")).toBeInTheDocument();
    expect(panel().getByText(/L7 Application/)).toBeInTheDocument();
  });

  it("the layer legend jumps to that layer's first field", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /^L4 TCP header/ }));
    expect(panel().getByText("Source Port")).toBeInTheDocument();
    expect(panel().getByText(/51000/)).toBeInTheDocument();
  });

  it("every byte of a selected multi-byte field is marked pressed", () => {
    render(<PacketWalkthrough />);
    fireEvent.click(screen.getByRole("button", { name: /^Byte 26:/ })); // Source IP, bytes 26-29
    for (const offset of [26, 27, 28, 29]) {
      expect(screen.getByRole("button", { name: new RegExp(`^Byte ${offset}:`) })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    expect(screen.getByRole("button", { name: /^Byte 30:/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });
});
