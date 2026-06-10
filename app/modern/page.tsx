import Link from "next/link";
import { Callout } from "@/components/content/Callout";
import { LAYERS } from "@/lib/layers";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "The Modern Internet, Layer by Layer",
  description:
    "CDNs and anycast, L4 vs L7 load balancers, VPNs and tunneling, IPv6 neighbor discovery, and overlay networks — the infrastructure behind every modern app, explained through the OSI lens.",
  path: "/modern/",
});

function LayerTag({ layer }: { layer: number }) {
  const l = LAYERS.find((x) => x.number === layer);
  if (!l) return null;
  return (
    <span
      className="rounded px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: l.color, color: "var(--on-accent)" }}
    >
      L{l.number} {l.name}
    </span>
  );
}

function SectionHeading({ title, layers }: { title: string; layers: number[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <span className="flex gap-1">
        {layers.map((l) => (
          <LayerTag key={l} layer={l} />
        ))}
      </span>
    </div>
  );
}

export default function ModernPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          The model meets production
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          The Modern Internet, Layer by Layer
        </h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Between your app and the textbook diagrams sits a thick layer of modern infrastructure:
          CDNs, load balancers, VPNs, cloud overlays. None of it appears in the 1984 model — and all
          of it snaps into place the moment you ask the model&rsquo;s question:{" "}
          <em>which layer&rsquo;s job is this thing doing?</em>
        </p>
      </header>

      <section className="mt-12">
        <SectionHeading title="CDNs: moving the content to the user" layers={[3, 7]} />
        <p className="mt-3 leading-relaxed">
          A content delivery network attacks the one thing bandwidth can&rsquo;t fix:{" "}
          <Link href="/layers/physical/" className="underline underline-offset-2">
            the speed of light
          </Link>
          . If every round trip to a far-away origin costs 100 ms, the cure is fewer and shorter
          round trips — so CDNs place thousands of edge caches near users and answer from the
          closest one.
        </p>
        <p className="mt-3 leading-relaxed">
          The interesting machinery is in how you reach the &ldquo;closest&rdquo; edge, and it spans
          two layers. <strong>DNS steering</strong> (Layer 7): the CDN&rsquo;s resolver hands out
          different IP addresses depending on where the query comes from. <strong>Anycast</strong>{" "}
          (Layer 3): many edge sites announce the <em>same</em> IP prefix via BGP, and ordinary
          routing delivers each packet to the topologically nearest site — one address, hundreds of
          locations, zero special client logic. Most large CDNs use both.
        </p>
        <Callout variant="insight" title="Anycast is just BGP being BGP">
          Nothing in IP says an address must live in one place. Announce a prefix from 200 cities
          and ordinary best-path route selection does the rest — every user reaches their nearest
          copy. The &ldquo;trick&rdquo; that serves half the web&rsquo;s traffic is a plain
          consequence of{" "}
          <Link href="/layers/network/" className="underline underline-offset-2">
            how routes are computed
          </Link>
          .
        </Callout>
      </section>

      <section className="mt-12">
        <SectionHeading title="Load balancers: L4 vs L7" layers={[4, 7]} />
        <p className="mt-3 leading-relaxed">
          &ldquo;What&rsquo;s the difference between an L4 and an L7 load balancer?&rdquo; is a
          standing interview question because the answer shows whether you can apply the model:
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr
                className="border-b text-left font-mono text-xs uppercase"
                style={{ borderColor: "var(--border)", color: "var(--fg-muted)" }}
              >
                <th className="py-2 pr-3"></th>
                <th className="py-2 pr-3">L4 (transport)</th>
                <th className="py-2">L7 (application)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Sees", "IPs, ports, TCP/UDP headers", "Full HTTP: paths, headers, cookies"],
                ["Decides by", "Hash of the 5-tuple", "Route, hostname, cookie, header"],
                [
                  "Can do",
                  "Spread connections fast and cheap",
                  "Path routing, sticky sessions, TLS termination, retries, caching",
                ],
                [
                  "Costs",
                  "Almost nothing — often one packet rewrite",
                  "A full TCP+TLS+HTTP stack per connection",
                ],
                [
                  "Examples",
                  "Cloud NLBs, IPVS, Google Maglev",
                  "nginx, HAProxy, Envoy, cloud ALBs",
                ],
              ].map(([label, l4, l7]) => (
                <tr
                  key={label}
                  className="border-b align-top"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap">{label}</td>
                  <td className="py-2 pr-3">{l4}</td>
                  <td className="py-2">{l7}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 leading-relaxed">
          The trade is visibility versus cost: an L7 balancer understands the conversation (so it
          can route <code className="font-mono text-sm">/api</code> differently from{" "}
          <code className="font-mono text-sm">/static</code>, or pin a user&rsquo;s session) but
          must terminate TCP and TLS to see it. An L4 balancer just forwards transport-level flows —
          blind but nearly free. Real architectures stack them: an L4 tier spreading across an L7
          tier. And the failure mode this site keeps returning to —{" "}
          <Link href="/layers/session/" className="underline underline-offset-2">
            random logouts when scaling
          </Link>{" "}
          — is what happens when an L4-style decision (any backend will do) meets L5 state that
          lives on one backend.
        </p>
      </section>

      <section className="mt-12">
        <SectionHeading title="VPNs and tunnels: stacks inside stacks" layers={[2, 3, 4]} />
        <p className="mt-3 leading-relaxed">
          A tunnel takes a complete packet — headers and all — and treats it as the <em>payload</em>{" "}
          of another protocol. Your &ldquo;inner&rdquo; IP packet to the office file server gets
          encrypted and wrapped in an &ldquo;outer&rdquo; UDP/IP packet addressed to the VPN
          gateway; the public internet routes the outer packet, never seeing the inner one.
          WireGuard and IPsec tunnel IP-in-UDP/IP this way; older corporate VPNs tunneled Layer 2
          frames; GRE tunnels almost anything in anything.
        </p>
        <p className="mt-3 leading-relaxed">
          Once you see tunneling as recursive encapsulation, a family of mysteries resolves at once.
          Why does a VPN shrink your{" "}
          <Link href="/layers/network/" className="underline underline-offset-2">
            MTU
          </Link>{" "}
          (and occasionally black-hole your large transfers)? The outer headers eat 60–80 bytes of
          every 1500-byte frame. Why can your employer&rsquo;s network not see your traffic, while
          the VPN provider can? Because the inner stack is encrypted at the outer stack&rsquo;s
          Presentation layer. What is &ldquo;split tunneling&rdquo;? A routing-table decision about
          which destinations enter the tunnel at all.
        </p>
      </section>

      <section className="mt-12">
        <SectionHeading title="IPv6's missing chapter: NDP and SLAAC" layers={[2, 3]} />
        <p className="mt-3 leading-relaxed">
          This site teaches{" "}
          <Link href="/layers/data-link/" className="underline underline-offset-2">
            ARP
          </Link>{" "}
          and{" "}
          <Link href="/layers/application/" className="underline underline-offset-2">
            DHCP
          </Link>{" "}
          — and IPv6 replaced both. The <strong>Neighbor Discovery Protocol</strong> (NDP, RFC 4861)
          re-implements ARP&rsquo;s job as ICMPv6 messages: Neighbor Solicitation asks &ldquo;who
          has this address?&rdquo; over efficient multicast instead of broadcast, and Neighbor
          Advertisement answers. The same protocol family adds Router Solicitation/Advertisement —
          routers periodically announce the network prefix.
        </p>
        <p className="mt-3 leading-relaxed">
          That enables <strong>SLAAC</strong> (stateless address autoconfiguration): a host hears
          the router&rsquo;s prefix, appends a self-generated interface identifier, verifies
          uniqueness with a Neighbor Solicitation (duplicate address detection), and is on the
          network — no DHCP server, no lease, no state held anywhere. DHCPv6 still exists for
          networks that want central control, but the IPv6 default is hosts configuring themselves.
        </p>
        <Callout variant="warning" title="Same jobs, new attack surface">
          NDP inherits ARP&rsquo;s trust problem: nothing authenticates a Neighbor or Router
          Advertisement, so ARP poisoning&rsquo;s IPv6 twin is rogue-RA — one host announcing itself
          as the network&rsquo;s router. Defenses are the same shape too: RA Guard on switches, the
          way{" "}
          <Link href="/layers/data-link/" className="underline underline-offset-2">
            DHCP snooping
          </Link>{" "}
          polices IPv4.
        </Callout>
      </section>

      <section className="mt-12">
        <SectionHeading title="Overlay networks: the cloud's secret layer" layers={[2, 3]} />
        <p className="mt-3 leading-relaxed">
          Inside clouds and Kubernetes clusters, the &ldquo;network&rdquo; your containers see is
          usually fictional — an <strong>overlay</strong> built by tunneling Layer 2 frames over the
          data center&rsquo;s real Layer 3 fabric. <strong>VXLAN</strong> is the workhorse: it wraps
          an entire Ethernet frame in UDP, adds a 24-bit network identifier (16 million isolated
          virtual LANs, against 802.1Q&rsquo;s 4,094), and lets two VMs believe they share a cable
          while standing in different buildings.
        </p>
        <p className="mt-3 leading-relaxed">
          The OSI lens makes the architecture legible: the <em>underlay</em> is a boring, reliable
          L3 network of routers; the <em>overlay</em> is virtual L2 stitched over it; and the
          encapsulation between them is the same move as a VPN, minus the encryption. When a
          container can&rsquo;t reach a pod, the debugging question is the classic one —{" "}
          <Link href="/troubleshoot/" className="underline underline-offset-2">
            which layer is broken
          </Link>
          , except now you ask it twice: once for the overlay, once for the underlay.
        </p>
        <Callout variant="insight" title="Nothing new under the sun">
          CDNs are caching plus routing. Load balancers are NAT with opinions. VPNs and VXLAN are
          encapsulation wearing trench coats. The modern internet is the same seven jobs, recombined
          — which is exactly why a 1984 model still pays your debugging bills.
        </Callout>
      </section>
    </main>
  );
}
