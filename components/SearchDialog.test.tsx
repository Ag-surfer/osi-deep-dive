import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchDialog } from "./SearchDialog";
import type { SearchRecord } from "@/lib/searchIndex";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

const RECORDS: SearchRecord[] = [
  {
    id: "glossary-nat",
    type: "glossary",
    title: "NAT",
    context: "Layer 3",
    body: "Network Address Translation.",
    href: "/glossary/",
  },
  {
    id: "section-network-nat",
    type: "section",
    title: "NAT: the workaround that ate the internet",
    context: "L3 Network",
    body: "translation table private addresses",
    href: "/layers/network/#nat-the-workaround-that-ate-the-internet",
  },
  {
    id: "layer-transport",
    type: "layer",
    title: "Layer 4 — Transport",
    context: "Process-to-process delivery",
    body: "TCP UDP QUIC ports",
    href: "/layers/transport/",
  },
];

function mockFetch() {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(RECORDS),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: /search the site/i }));
  // Index fetch resolves on the microtask queue.
  await screen.findByRole("combobox");
  await vi.waitFor(() => expect(screen.queryByText(/Loading the index/)).not.toBeInTheDocument());
}

describe("SearchDialog", () => {
  beforeEach(() => {
    push.mockClear();
    vi.unstubAllGlobals();
  });

  it("fetches the index lazily on first open, then searches", async () => {
    const fetchMock = mockFetch();
    render(<SearchDialog />);
    expect(fetchMock).not.toHaveBeenCalled();
    await openDialog();
    expect(fetchMock).toHaveBeenCalledWith("/search-index.json");
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "nat" } });
    expect(screen.getByText("NAT")).toBeInTheDocument();
    expect(screen.getByText(/workaround that ate/)).toBeInTheDocument();
    expect(screen.getByText("2 results")).toBeInTheDocument();
  });

  it("opens with Cmd-K", async () => {
    mockFetch();
    render(<SearchDialog />);
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(await screen.findByRole("combobox")).toBeVisible();
  });

  it("navigates with arrow keys and Enter", async () => {
    mockFetch();
    render(<SearchDialog />);
    await openDialog();
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "nat" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/layers/network/#nat-the-workaround-that-ate-the-internet");
  });

  it("clicking a result navigates", async () => {
    mockFetch();
    render(<SearchDialog />);
    await openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "transport" } });
    fireEvent.click(screen.getByText("Layer 4 — Transport"));
    expect(push).toHaveBeenCalledWith("/layers/transport/");
  });

  it("shows an empty state for no matches", async () => {
    mockFetch();
    render(<SearchDialog />);
    await openDialog();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzzz" } });
    expect(screen.getByText(/No matches/)).toBeInTheDocument();
  });
});
