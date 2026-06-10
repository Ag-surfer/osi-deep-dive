/**
 * The troubleshooting methodology: diagnosis strategies, the tool-to-layer
 * map, and worked diagnoses in the form engineers actually experience them —
 * symptom → command → what the output eliminates → next move.
 */

export interface DiagStrategy {
  name: string;
  how: string;
  when: string;
}

export const STRATEGIES: DiagStrategy[] = [
  {
    name: "Bottom-up",
    how: "Start at Layer 1 and climb: link light → interface up → ARP → ping gateway → ping beyond → DNS → application.",
    when: "Best when the failure is total (nothing works) or you suspect hardware — cables, ports, radios. Slow but exhaustive; the field-tech default.",
  },
  {
    name: "Top-down",
    how: "Start at the application and descend: does the app error? does curl work? does TLS negotiate? does DNS resolve? does TCP connect?",
    when: "Best when something works (so the lower stack is probably fine) — one app is broken while others are healthy. The developer default.",
  },
  {
    name: "Divide and conquer",
    how: "Start in the middle — usually Layer 3: ping the destination. Success proves Layers 1–3 end-to-end, so go up; failure sends you down.",
    when: "Best general-purpose strategy: one command eliminates half the stack. This is binary search applied to the OSI model.",
  },
];

export interface ToolEntry {
  tool: string;
  layers: number[];
  asks: string;
  proves: string;
}

export const TOOLS: ToolEntry[] = [
  {
    tool: "link LED / ethtool / ifconfig",
    layers: [1],
    asks: "Is there signal on the medium, and what speed/duplex negotiated?",
    proves:
      "Link up at expected speed rules out cabling and negotiation; 'no carrier' or a 100 Mb/s surprise localizes the fault to Layer 1.",
  },
  {
    tool: "arp -a / ip neigh",
    layers: [2, 3],
    asks: "Did IP-to-MAC resolution work for the gateway and neighbors?",
    proves:
      "An entry for the gateway proves L1–L2 to the router work. A missing or flapping entry means a Layer 2 problem (VLAN, cable, duplicate IP).",
  },
  {
    tool: "ip addr / ip route",
    layers: [3],
    asks: "Do I have an address, a mask, and a default route — and are they sane?",
    proves:
      "A 169.254.x.x address means DHCP failed; a wrong mask or missing default route explains 'some destinations unreachable' instantly.",
  },
  {
    tool: "ping",
    layers: [3],
    asks: "Can IP packets reach this address and return?",
    proves:
      "Success proves Layers 1–3 end-to-end (and halves the search). Failure proves nothing by itself — ICMP is often filtered; corroborate before concluding.",
  },
  {
    tool: "traceroute / mtr",
    layers: [3],
    asks: "Which hop does the path die or degrade at?",
    proves:
      "Localizes a routing problem to a specific hop or network boundary; repeating hops reveal a routing loop. (* * * may just be a hop ignoring ICMP.)",
  },
  {
    tool: "dig / nslookup",
    layers: [7],
    asks: "Does the name resolve, on which server, to what, and how fast?",
    proves:
      "Separates 'the network is down' from 'it's always DNS.' Compare your resolver against a public one to localize resolver vs. authoritative faults.",
  },
  {
    tool: "ss -tlnp / ss -tan",
    layers: [4],
    asks: "Is anything listening on the port (-tlnp), and what state is every connection in (-tan)?",
    proves:
      "No listener explains 'connection refused'; in the -tan view, piles of SYN-RECV suggest a flood and piles of TIME_WAIT explain ephemeral-port exhaustion.",
  },
  {
    tool: "curl -v",
    layers: [4, 5, 6, 7],
    asks: "Walk the whole upper stack: TCP connect, TLS handshake, HTTP exchange — verbosely.",
    proves:
      "Its output is layer-by-layer evidence: where the -v trace stops is where the stack is broken (connect vs certificate vs 500). Add --trace-time to timestamp each line.",
  },
  {
    tool: "openssl s_client -connect",
    layers: [5, 6],
    asks: "Does the TLS handshake complete, and what certificate chain came back?",
    proves:
      "Isolates Presentation-layer failures: expired/wrong-host certificates, protocol or cipher mismatches — independent of any browser cache.",
  },
  {
    tool: "tcpdump / Wireshark",
    layers: [2, 3, 4, 7],
    asks: "What is actually on the wire?",
    proves:
      "Ground truth that ends arguments: retransmissions, RSTs, ARP storms, MTU-sized silence. When tools above disagree, the capture is the referee.",
  },
];

export interface DiagStep {
  action: string;
  observation: string;
  conclusion: string;
}

export interface WorkedDiagnosis {
  id: string;
  title: string;
  symptom: string;
  /** The broken layer, 1–7. */
  layer: number;
  steps: DiagStep[];
  lesson: string;
}

export const DIAGNOSES: WorkedDiagnosis[] = [
  {
    id: "mtu-blackhole",
    title: "The transfer that dies at 1%",
    symptom:
      "From a branch office over a new VPN: ping works, SSH logs in fine — but every large file copy and most HTTPS pages hang forever.",
    layer: 3,
    steps: [
      {
        action: "ping head-office server",
        observation: "0% loss, normal latency",
        conclusion:
          "Layers 1–3 work for small packets. Whatever this is, it isn't 'the network is down.'",
      },
      {
        action: "ssh in; run ls, then cat a large log file",
        observation: "Login and small output fine; the cat hangs mid-stream",
        conclusion:
          "Small payloads pass, large ones die — a size-dependent failure. Suspicion: MTU.",
      },
      {
        action:
          "ping -D -s 1472 server (full-size packet, don't-fragment; Linux: ping -M do -s 1472)",
        observation: "100% loss; ping -D -s 1300 works",
        conclusion:
          "Packets above ~1400 bytes vanish silently. The VPN tunnel shrank the path MTU.",
      },
      {
        action: "tcpdump on the client during a transfer",
        observation:
          "Large segments sent, never ACKed, retransmitted, no ICMP 'fragmentation needed' ever arrives",
        conclusion:
          "Path MTU Discovery is broken: a firewall is eating the ICMP messages that would tell senders to shrink. Classic MTU black hole.",
      },
    ],
    lesson:
      "Size-dependent failures are Layer 3's signature. Fix: allow ICMP type 3 code 4 through the firewall, or clamp TCP MSS on the tunnel. The diagnostic gold was 'small works, big hangs.'",
  },
  {
    id: "always-dns",
    title: "Down for everyone — except by IP",
    symptom:
      "Users report the internal wiki is down. Monitoring agrees. An engineer demonstrates it loads instantly by raw IP address.",
    layer: 7,
    steps: [
      {
        action: "curl http://10.4.2.20/ (by IP)",
        observation: "200 OK, full page",
        conclusion:
          "One command proves Layers 1–6 healthy end-to-end and the web server up. Only naming can be broken.",
      },
      {
        action: "dig wiki.corp.example",
        observation: "SERVFAIL from the internal resolver",
        conclusion: "The name itself fails. Now localize: is it this resolver or the records?",
      },
      {
        action: "dig wiki.corp.example @backup-resolver",
        observation: "Resolves correctly",
        conclusion: "Records are fine; the primary resolver is sick. Failover and fix it.",
      },
    ],
    lesson:
      "By-IP success is the fastest stack-eliminator in the book — and 'it's always DNS' earns its reputation because every connection begins with a lookup. Beware negative caching prolonging recovery after the fix.",
  },
  {
    id: "refused-vs-timeout",
    title: "Refused is information; timeout is silence",
    symptom:
      "After last night's patching, the app can't reach its database: 'connection refused', instantly.",
    layer: 4,
    steps: [
      {
        action: "ping db-host",
        observation: "Instant replies",
        conclusion: "Layers 1–3 fine. And note: the failure was instant, not a slow timeout.",
      },
      {
        action: "Reason about the error itself",
        observation: "'Refused' = a TCP RST came back; the host's OS answered",
        conclusion:
          "Packets reach the host, and something actively answered 'no.' Most firewalls DROP silently (slow timeout), so suspicion shifts to no-listener — though a REJECT rule can forge an RST too. The next step settles it either way.",
      },
      {
        action: "ssh db-host; ss -tlnp | grep 5432",
        observation: "Nothing listening; systemctl shows the DB failed to start after patching",
        conclusion:
          "Root cause found at the source: failed service start. Restart, then add a post-patch health check.",
      },
    ],
    lesson:
      "Layer 4's error semantics are diagnostic gifts: RST means reachable-but-no-listener; timeout means packets vanishing (firewall, routing, or dead host). Read the failure mode before reaching for tools.",
  },
];

/** The divide-and-conquer ladder, in execution order. */
export const LADDER: { check: string; ifGood: string; ifBad: string }[] = [
  {
    check: "ping 8.8.8.8 (a public IP, no DNS involved)",
    ifGood: "Layers 1–3 work to the internet. Go UP the stack →",
    ifBad:
      "Go DOWN: ping your gateway. (Caveat: some networks filter ICMP — corroborate with a TCP probe like curl to an IP before trusting a failure.)",
  },
  {
    check: "Up: dig example.com — does DNS resolve?",
    ifGood: "Try curl -v https://… and read where the trace stops (TCP? TLS? HTTP?).",
    ifBad: "It's DNS: test against a public resolver to localize (resolver vs records).",
  },
  {
    check: "Down: ping <gateway> — can you cross your own LAN?",
    ifGood:
      "Your LAN is fine; the fault is beyond the router (ISP/routing) — traceroute to localize the hop.",
    ifBad: "Go lower: ip addr (got a real address?), arp -a (gateway resolved?), link light/speed.",
  },
];
