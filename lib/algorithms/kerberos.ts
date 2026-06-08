/**
 * The Kerberos authentication exchange, instrumented as a step sequence for the
 * interactive walkthrough. Kerberos lets a client prove its identity to services
 * using time-limited **tickets** issued by a trusted **Key Distribution Center
 * (KDC)** — without the user's password ever crossing the network, and enabling
 * single sign-on. The classic flow has three round trips: get a Ticket-Granting
 * Ticket from the AS, exchange it for a service ticket at the TGS, then present
 * that ticket to the service.
 *
 * Pure and deterministic so it is unit tested.
 */

export interface KerbActor {
  id: string;
  label: string;
  sub: string;
}

export type KerbKind = "request" | "grant" | "present" | "confirm";

export interface KerbStep {
  from: string;
  to: string;
  kind: KerbKind;
  label: string;
  narration: string;
}

export interface KerbResult {
  actors: KerbActor[];
  steps: KerbStep[];
}

/** Build the Kerberos exchange for `user` authenticating to `service`. */
export function kerberosSteps(user = "alice", service = "fileserver"): KerbResult {
  const actors: KerbActor[] = [
    { id: "client", label: "Client", sub: `(${user})` },
    { id: "as", label: "AS", sub: "Auth Server (KDC)" },
    { id: "tgs", label: "TGS", sub: "Ticket-Granting (KDC)" },
    { id: "service", label: "Service", sub: `(${service})` },
  ];

  const steps: KerbStep[] = [
    {
      from: "client",
      to: "as",
      kind: "request",
      label: "AS-REQ: I am " + user,
      narration: `The client tells the Authentication Server who it claims to be. Crucially, the password is NOT sent — only the username.`,
    },
    {
      from: "as",
      to: "client",
      kind: "grant",
      label: "AS-REP: TGT + session key",
      narration: `The AS returns a Ticket-Granting Ticket (TGT) and a session key, encrypted with a key derived from ${user}'s password. Only the real ${user}, who knows the password, can decrypt it — that decryption IS the proof of identity.`,
    },
    {
      from: "client",
      to: "tgs",
      kind: "present",
      label: `TGS-REQ: TGT + want ${service}`,
      narration: `To reach the ${service}, the client presents its TGT to the Ticket-Granting Server and asks for a ticket to that specific service. The TGT proves it already authenticated — no password again.`,
    },
    {
      from: "tgs",
      to: "client",
      kind: "grant",
      label: "TGS-REP: service ticket",
      narration: `The TGS validates the TGT and issues a service ticket plus a fresh session key for the ${service}. This is single sign-on: one login (the TGT) unlocks many services without re-entering credentials.`,
    },
    {
      from: "client",
      to: "service",
      kind: "present",
      label: "AP-REQ: service ticket + authenticator",
      narration: `The client presents the service ticket and a freshly-timestamped authenticator to the ${service}. The service decrypts the ticket with its own secret key (shared with the KDC) to trust it — the KDC vouched for the client.`,
    },
    {
      from: "service",
      to: "client",
      kind: "confirm",
      label: "AP-REP: mutual auth, access granted",
      narration: `The service proves itself back to the client (mutual authentication) and grants access. At no point did the password traverse the network, and the service never had to store the user's credentials.`,
    },
  ];

  return { actors, steps };
}
