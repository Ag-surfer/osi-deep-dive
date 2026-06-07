import type { QuizQuestion } from "@/components/Quiz";

/** A final-quiz question, tagged with the layer it tests (0 = cross-cutting). */
export interface FinalQuestion extends QuizQuestion {
  layer: number;
}

/**
 * Cross-layer final exam — synthesis questions spanning all seven layers plus the
 * cross-cutting ideas (encapsulation, round trips, OSI↔TCP/IP). Distinct from the
 * per-layer self-checks.
 */
export const FINAL_QUIZ: FinalQuestion[] = [
  {
    layer: 0,
    q: "As data descends the sender's stack, in what order are the PDUs produced?",
    options: [
      "Bits → Frame → Packet → Segment → Data",
      "Data → Segment → Packet → Frame → Bits",
      "Packet → Segment → Frame → Data → Bits",
    ],
    answer: 1,
    explanation:
      "Layers 7–5 produce data, Transport a segment, Network a packet, Data Link a frame, Physical bits — each layer wraps the one above.",
  },
  {
    layer: 3,
    q: "A packet crosses four routers from source to destination. Between hops, what changes and what stays constant?",
    options: [
      "The IP addresses change; the MAC addresses stay",
      "The MAC addresses change; the IP addresses stay",
      "Both change at every hop",
    ],
    answer: 1,
    explanation:
      "The destination IP is the final host (fixed end-to-end); each link's frame is re-addressed with the next hop's MAC.",
  },
  {
    layer: 1,
    q: "Why does Ethernet use line codes like Manchester or 8b/10b instead of plain NRZ?",
    options: [
      "To use less bandwidth",
      "To guarantee signal transitions so the receiver can recover the clock",
      "To add forward error correction",
    ],
    answer: 1,
    explanation:
      "There's no separate clock wire; frequent transitions keep the receiver's clock synchronized with the data.",
  },
  {
    layer: 4,
    q: "What does the TCP three-way handshake establish before any data flows?",
    options: [
      "Encryption keys",
      "Both sides' initial sequence numbers",
      "The DNS name of the server",
    ],
    answer: 1,
    explanation:
      "SYN / SYN-ACK / ACK synchronizes each side's initial sequence number. Encryption (TLS) is a separate, higher-layer step.",
  },
  {
    layer: 2,
    q: "Why can a MAC address not be used to route across the internet?",
    options: [
      "It is too short to be unique",
      "It is flat (no hierarchy), so routes can't be aggregated",
      "It changes at every hop",
    ],
    answer: 1,
    explanation:
      "MAC addresses are flat identifiers tied to a NIC; global routing needs the hierarchy that IP addressing provides.",
  },
  {
    layer: 7,
    q: "Before your browser can open a TCP connection to example.com, what must happen first?",
    options: [
      "A TLS handshake",
      "DNS resolves the name to an IP address",
      "An ARP request sent to the server",
    ],
    answer: 1,
    explanation:
      "DNS turns example.com into an IP address; only then can the transport connection be addressed and opened.",
  },
  {
    layer: 6,
    q: "Which layer's role is to encrypt the application's data (e.g. with TLS) before transmission?",
    options: ["Transport", "Presentation", "Network"],
    answer: 1,
    explanation:
      "Encoding and encryption are the Presentation layer's job; TLS is its canonical real-world example.",
  },
  {
    layer: 5,
    q: "In the TCP/IP model that runs the real internet, the OSI Session layer is:",
    options: [
      "A dedicated protocol on a well-known port",
      "Absorbed into the transport layer, applications, and libraries",
      "Just another name for the Network layer",
    ],
    answer: 1,
    explanation:
      "TCP/IP has no separate session protocol; its duties live in TCP connections, app protocols, and libraries (e.g. TLS session resumption).",
  },
  {
    layer: 0,
    q: "Loading https://example.com cold costs several round trips before the first byte. Which is NOT an end-to-end round trip?",
    options: [
      "The DNS lookup",
      "The TCP handshake",
      "The local ARP broadcast for the gateway's MAC",
      "The TLS handshake",
    ],
    answer: 2,
    explanation:
      "DNS, TCP, and TLS each cost an end-to-end round trip; ARP is a single exchange on the local link, not an end-to-end RTT.",
  },
  {
    layer: 4,
    q: "Which layer introduces port numbers to deliver data to the right process on a host?",
    options: ["Network", "Transport", "Session"],
    answer: 1,
    explanation:
      "Ports are the Transport-layer address, letting one host's IP serve many simultaneous processes.",
  },
  {
    layer: 0,
    q: "In the four-layer TCP/IP model, OSI layers 5, 6, and 7 collapse into which single layer?",
    options: ["Transport", "Application", "Link"],
    answer: 1,
    explanation: "TCP/IP folds Session, Presentation, and Application into one Application layer.",
  },
  {
    layer: 2,
    q: "What does the Data Link layer add around a packet that the Network layer does not?",
    options: [
      "A logical (IP) address",
      "A frame header plus an FCS trailer for error detection on the local link",
      "A port number",
    ],
    answer: 1,
    explanation:
      "L2 frames the packet with MAC addressing and appends a CRC (FCS) so corrupt frames on the link are detected and dropped.",
  },
];
