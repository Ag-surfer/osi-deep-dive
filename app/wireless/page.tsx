import Link from "next/link";
import { Callout } from "@/components/content/Callout";
import { HeaderDiagram } from "@/components/HeaderDiagram";
import { SequenceDiagram } from "@/components/SequenceDiagram";
import { Quiz } from "@/components/Quiz";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Wireless: The Stack Without Wires",
  description:
    "Wi-Fi in depth: BSS and ESS architecture, why the 802.11 frame carries three MAC addresses, the association handshake, WEP to WPA3 security evolution, Wi-Fi generations — and how cellular solves the same problems differently.",
  path: "/wireless/",
});

export default function WirelessPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          Layers 1–2, airborne
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          Wireless: The Stack Without Wires
        </h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Wires give you a private, reliable medium where collisions are detectable and
          eavesdroppers need physical access. Radio gives you none of that — so wireless networking
          is the story of rebuilding Layer 1 and Layer 2 assumptions for a shared, unreliable,
          public medium. This page goes deeper than{" "}
          <Link href="/layers/data-link/" className="underline underline-offset-2">
            the Data Link page&rsquo;s CSMA/CA story
          </Link>
          : the architecture, the frame, the security saga, and how cellular answers the same
          questions differently.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">BSS, ESS, and what an AP actually is</h2>
        <p className="mt-3 leading-relaxed">
          802.11&rsquo;s unit of organization is the <strong>BSS</strong> (basic service set): one
          access point plus the stations associated to it, identified by the <strong>BSSID</strong>{" "}
          — the AP radio&rsquo;s MAC address. The <strong>SSID</strong> is different: it&rsquo;s the
          human-readable network <em>name</em>. One name can cover many access points: an{" "}
          <strong>ESS</strong> (extended service set) is multiple BSSs advertising the same SSID,
          glued together by a (usually wired) distribution system. That&rsquo;s how your laptop
          keeps &ldquo;CorpWiFi&rdquo; while walking between floors — it <strong>roams</strong>,
          re-associating from one BSS to another, ideally fast enough that TCP connections never
          notice.
        </p>
        <p className="mt-3 leading-relaxed">
          The access point itself is a Layer-2 relay: a translating bridge between 802.11 frames on
          the air and 802.3 frames on the wire. Every frame between a station and anywhere else
          takes <em>two</em> Layer-2 hops — station to AP over radio, AP onward over Ethernet —
          which is precisely why the 802.11 frame needs more addresses than Ethernet&rsquo;s two.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">
          The 802.11 frame — and the three-address puzzle
        </h2>
        <p className="mt-3 leading-relaxed">
          &ldquo;Why does a Wi-Fi frame have <em>three</em> MAC addresses?&rdquo; is a classic
          interview question, and the answer falls out of the relay architecture. On the radio hop
          you must name the <strong>transmitter</strong> and <strong>receiver</strong> (who is
          radiating, who should decode). But the frame is usually <em>in transit</em> between the
          wireless world and the wired one — so you also need the <strong>other end</strong>: the
          ultimate source or destination beyond the AP.
        </p>
        <HeaderDiagram
          title="802.11 data frame, MAC header (infrastructure mode, non-QoS)"
          fields={[
            {
              name: "Frame Control",
              bits: 16,
              desc: "Type/subtype (data, management, control), protocol version, and the ToDS/FromDS bits that determine how the three addresses are interpreted — plus power-management and protection flags.",
            },
            {
              name: "Duration / ID",
              bits: 16,
              desc: "Microseconds the medium will be busy, including the coming ACK. Other stations read this to set their NAV (network allocation vector) — virtual carrier sensing, the mechanism RTS/CTS rides on.",
            },
            {
              name: "Address 1 — Receiver",
              bits: 48,
              desc: "Who should decode this transmission on the air. Station → AP: the BSSID. AP → station: the station's MAC.",
            },
            {
              name: "Address 2 — Transmitter",
              bits: 48,
              desc: "Who is radiating right now. Also the address the link-layer ACK is sent back to.",
            },
            {
              name: "Address 3 — The other end",
              bits: 48,
              desc: "The address beyond the radio hop. Station → AP (ToDS=1): the final destination on the wire. AP → station (FromDS=1): the original source. This is what lets the AP bridge radio and Ethernet.",
            },
            {
              name: "Sequence Control",
              bits: 16,
              desc: "Sequence + fragment numbers, used to detect duplicate frames — necessary because link-layer retransmission means the same frame may legitimately arrive twice.",
            },
            {
              name: "Payload",
              bits: 32,
              variable: true,
              desc: "The upper-layer packet (typically an IP packet), encrypted by WPA2/WPA3 between station and AP. Up to 2304 bytes.",
            },
            {
              name: "FCS",
              bits: 32,
              desc: "CRC-32 over the whole frame, same as Ethernet. The receiver silently discards a corrupt frame and sends no ACK — the missing ACK is what triggers the sender's link-layer retransmission.",
            },
          ]}
        />
        <Callout variant="insight" title="And sometimes four">
          A fourth address field appears when <em>both</em> ToDS and FromDS are set — frames relayed
          AP-to-AP over the air (mesh / WDS). Then the radio hop&rsquo;s transmitter/receiver and
          the original source/final destination are four distinct machines, and the frame names them
          all. The general rule: one address pair per hop being described, and the 802.11 header can
          describe two.
        </Callout>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">
          Joining a network: scan, authenticate, associate
        </h2>
        <p className="mt-3 leading-relaxed">
          Before any data flows, a station joins the BSS in three steps — discovery (listening for
          the AP&rsquo;s periodic <strong>beacons</strong>, or actively probing), an authentication
          exchange (a legacy formality under WPA2 — but under WPA3 this is where the{" "}
          <strong>SAE</strong> password-proving exchange happens), and <strong>association</strong>,
          where the AP allocates state for the station. The <strong>4-way handshake</strong> then
          derives fresh session keys — under WPA2 it also carries the proof that both sides hold the
          credential, without ever transmitting it.
        </p>
        <SequenceDiagram
          actors={["Station", "Access point"]}
          steps={[
            { from: 1, to: 0, label: "Beacon (SSID, capabilities) — every ~100 ms", dashed: true },
            { from: 0, to: 1, label: "Authentication (WPA3: the SAE exchange happens here)" },
            { from: 0, to: 1, label: "Association request → response (AID assigned)" },
            { from: 0, to: 1, label: "4-way handshake — fresh keys derived (WPA2/WPA3)" },
            { from: 0, to: 1, label: "Encrypted data flows" },
          ]}
          caption="Joining a Wi-Fi network: discover, associate, derive keys, communicate. Roaming repeats this with the next AP — fast-roaming standards (802.11r) shortcut the key derivation."
        />
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Security: a 25-year repair job</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr
                className="border-b text-left font-mono text-xs uppercase"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <th className="py-2 pr-3">Era</th>
                <th className="py-2 pr-3">Crypto</th>
                <th className="py-2">What went wrong / right</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "WEP (1997)",
                  "RC4, static keys",
                  "Broken by design: reused keystreams (24-bit IVs) let attackers recover the key from captured traffic in minutes. 'Wired Equivalent Privacy' became a cautionary tale.",
                ],
                [
                  "WPA (2003)",
                  "TKIP (RC4 rekeyed)",
                  "A stopgap engineered to run on WEP-era hardware while WPA2 was finished — better, still RC4, now also retired.",
                ],
                [
                  "WPA2 (2004)",
                  "AES-CCMP",
                  "The two-decade workhorse. Solid cipher; its weak spot is the handshake around it — KRACK (2017) replayed handshake messages, and the PSK is offline-guessable from one captured handshake if the passphrase is weak.",
                ],
                [
                  "WPA3 (2018)",
                  "AES + SAE handshake",
                  "SAE (a PAKE) fixes the systemic flaw: every guess at the password now requires a live exchange with the network — no more offline cracking — and forward secrecy protects past traffic if the password later leaks.",
                ],
              ].map(([era, crypto, story]) => (
                <tr
                  key={era}
                  className="border-b align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{era}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{crypto}</td>
                  <td className="py-2">{story}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout variant="security" title="What encryption covers — and what it never did">
          Wi-Fi encryption protects the <em>radio hop only</em> — station to AP. Beyond the AP your
          traffic is whatever the upper layers made it, which is why TLS matters even on
          &ldquo;secure&rdquo; Wi-Fi. And management frames went unprotected for decades — anyone
          could forge a <strong>deauthentication</strong> frame and knock you offline (the classic
          tool of Wi-Fi attackers and hotel networks alike). 802.11w/WPA3 finally integrity-protects
          them.
        </Callout>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">The generations, decoded</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr
                className="border-b text-left font-mono text-xs uppercase"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Standard</th>
                <th className="py-2 pr-3">Bands</th>
                <th className="py-2">The headline idea</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Wi-Fi 4",
                  "802.11n",
                  "2.4 + 5 GHz",
                  "MIMO — multiple antennas, multiple spatial streams",
                ],
                [
                  "Wi-Fi 5",
                  "802.11ac",
                  "5 GHz",
                  "Wider channels (160 MHz), downlink MU-MIMO, 256-QAM",
                ],
                [
                  "Wi-Fi 6/6E",
                  "802.11ax",
                  "2.4 + 5 (+6) GHz",
                  "OFDMA — subdividing channels among users (cellular thinking arrives in Wi-Fi); 1024-QAM; 6E adds the clean 6 GHz band",
                ],
                [
                  "Wi-Fi 7",
                  "802.11be",
                  "2.4 + 5 + 6 GHz",
                  "320 MHz channels, 4096-QAM, multi-link operation (using several bands at once)",
                ],
              ].map(([name, std, bands, idea]) => (
                <tr
                  key={std}
                  className="border-b align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{name}</td>
                  <td className="py-2 pr-3 font-mono whitespace-nowrap">{std}</td>
                  <td className="py-2 pr-3 whitespace-nowrap">{bands}</td>
                  <td className="py-2">{idea}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The through-line: each generation buys speed from the{" "}
          <Link href="/layers/physical/" className="underline underline-offset-2">
            same Layer 1 levers
          </Link>{" "}
          — denser QAM constellations (needing ever-better SNR), wider channels, more spatial
          streams, and smarter sharing of the medium.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Cellular: the other answer</h2>
        <p className="mt-3 leading-relaxed">
          LTE and 5G face the same physics but chose opposite trade-offs. Wi-Fi is{" "}
          <strong>contention</strong>: unlicensed spectrum, anyone may transmit, CSMA/CA arbitrates,
          and collisions waste airtime. Cellular is <strong>scheduling</strong>: the operator owns
          licensed spectrum, and the base station <em>grants</em> every device specific time and
          frequency slots — no contention, predictable latency, efficient at scale, at the cost of
          central coordination and your monthly bill. Roaming becomes <strong>handover</strong>: the
          network orchestrates the move between towers while keeping your IP session alive, rather
          than the client re-associating on its own.
        </p>
        <Callout variant="insight" title="One spectrum question, two philosophies">
          Who may transmit right now? Wi-Fi answers &ldquo;whoever wins the listen-and-back-off
          game&rdquo; (distributed, cheap, unlicensed). Cellular answers &ldquo;whoever the tower
          schedules&rdquo; (centralized, guaranteed, licensed). Almost every difference between them
          — latency jitter, density handling, cost — follows from that one design choice. And
          they&rsquo;re converging: Wi-Fi 6&rsquo;s OFDMA is scheduling sneaking into Wi-Fi.
        </Callout>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Check your understanding</h2>
        <Quiz
          questions={[
            {
              q: "A laptop sends a frame to a server on the wired LAN through an AP. What's in Address 3?",
              options: ["The AP's BSSID", "The server's MAC", "The laptop's MAC"],
              answer: 1,
              explanation:
                "On the air, Address 1 = receiver (the AP/BSSID), Address 2 = transmitter (the laptop). Address 3 carries the ultimate destination so the AP can build the Ethernet frame onward.",
            },
            {
              q: "Why does WPA3's SAE handshake end offline password cracking?",
              options: [
                "It uses a longer password",
                "Each password guess requires a live exchange with the network — captured traffic alone is useless",
                "It hides the SSID",
              ],
              answer: 1,
              explanation:
                "SAE is a PAKE: the handshake proves knowledge of the password without transmitting anything an attacker can grind against offline. WPA2-PSK handshake captures, by contrast, can be brute-forced at leisure.",
            },
            {
              q: "Wi-Fi retransmits lost frames at Layer 2; Ethernet doesn't. Why the difference?",
              options: [
                "Wi-Fi hardware is faster",
                "Radio loses frames routinely, so local recovery is cheaper than waiting for TCP's end-to-end retransmission",
                "Ethernet frames are smaller",
              ],
              answer: 1,
              explanation:
                "On a near-lossless wire, dropping rare corrupt frames and letting TCP recover is cheaper. On lossy radio, paying a full end-to-end RTT per loss would be ruinous — so 802.11 ACKs and retransmits every unicast frame locally.",
            },
          ]}
        />
      </section>

      <section className="mt-12 rounded-lg border p-6" style={{ borderColor: "var(--border)" }}>
        <h2 className="font-serif text-xl font-bold">Where this connects</h2>
        <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The medium-sharing story starts in{" "}
          <Link href="/layers/data-link/" className="underline underline-offset-2">
            Data Link (CSMA/CA, hidden terminals)
          </Link>
          ; the modulation lever lives in{" "}
          <Link href="/layers/physical/" className="underline underline-offset-2">
            Physical (QAM, OFDM)
          </Link>
          ; and BBR&rsquo;s tolerance of random radio loss is in{" "}
          <Link href="/layers/transport/" className="underline underline-offset-2">
            Transport
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
