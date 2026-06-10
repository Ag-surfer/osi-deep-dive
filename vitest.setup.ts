import "@testing-library/jest-dom/vitest";

// The jsdom version in this environment errors on <dialog>'s modal API
// (verified: removing this shim fails the SearchDialog suite with 5 errors) —
// minimal test-only replacement. Re-test without it on jsdom upgrades.
if (typeof HTMLDialogElement !== "undefined") {
  HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
    if (!this.open) return; // matches the real API: closing a closed dialog is a no-op
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}
