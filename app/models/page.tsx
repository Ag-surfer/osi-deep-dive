import Link from "next/link";
import { OsiTcpIpMap } from "@/components/OsiTcpIpMap";
import { Callout } from "@/components/content/Callout";
import { Quiz } from "@/components/Quiz";
import { pageMetadata } from "@/lib/site";

export const metadata = pageMetadata({
  title: "OSI vs TCP/IP: The History",
  description:
    "Why TCP/IP won the protocol wars, why the OSI model survived as the industry's vocabulary anyway, how the 7-, 5-, and 4-layer models map to each other — and where real protocols refuse to fit.",
  path: "/models/",
});

export default function ModelsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header>
        <p
          className="font-mono text-xs font-semibold tracking-wide uppercase"
          style={{ color: "var(--fg-muted)" }}
        >
          Why you&rsquo;re learning a model that &ldquo;lost&rdquo;
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">
          OSI vs TCP/IP: The History
        </h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Every networking student eventually notices the contradiction: the internet runs on
          TCP/IP, yet every course, certification, and interview is organized around OSI&rsquo;s
          seven layers. The resolution is one of computing&rsquo;s best stories — a standards war
          where one side won the networks and the other won the language.
        </p>
      </header>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">The protocol wars</h2>
        <p className="mt-3 leading-relaxed">
          In the late 1970s two camps set out to standardize networking. The{" "}
          <strong>ISO/OSI effort</strong> was networking done as international diplomacy: committees
          from telecom monopolies and governments designing a complete, correct, seven-layer
          architecture <em>before</em> building it. The result — the Basic Reference Model,
          published in 1984 — was intellectually magnificent and grew a full protocol suite (X.400
          email, X.500 directories, TP0–TP4 transports) that was complex, slow to ship, and
          expensive to implement.
        </p>
        <p className="mt-3 leading-relaxed">
          The <strong>TCP/IP camp</strong> was networking done as engineering: a small ARPA-funded
          research community whose specifications were free documents called RFCs, whose motto
          became <em>&ldquo;rough consensus and running code,&rdquo;</em> and whose protocols
          shipped inside the operating system universities already ran — BSD Unix, where the sockets
          API made network programming feel like file I/O. TCP/IP became the ARPANET&rsquo;s
          standard on January 1, 1983; by the time OSI implementations existed, an entire generation
          of engineers and equipment already spoke IP.
        </p>
        <Callout variant="history" title="Governments bet on the loser">
          From the late 1980s into the early 1990s, official policy in the US and Europe (GOSIP
          mandates) <em>required</em>
          government purchases to support OSI protocols — while everyone&rsquo;s actual traffic ran
          over TCP/IP. The mandates quietly died in the 1990s as the web (HTTP over TCP/IP) made the
          question moot. Lesson cited by engineers ever since: shipped and imperfect beats specified
          and late.
        </Callout>
        <p className="mt-3 leading-relaxed">
          Why did TCP/IP win? It was <strong>free</strong> (open specs, BSD code), it was{" "}
          <strong>running</strong> (you could install it, today), it was{" "}
          <strong>simple enough</strong> to implement in a university lab, and it was{" "}
          <strong>good enough</strong> — best-effort IP plus end-to-end TCP solved the actual
          problem. OSI&rsquo;s completeness became its weight: by aiming to standardize everything,
          it shipped nothing in time to matter.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Why the model survived its protocols</h2>
        <p className="mt-3 leading-relaxed">
          The OSI <em>protocols</em> are museum pieces; the OSI <em>model</em> became the
          industry&rsquo;s coordinate system. The reason is pedagogical and practical: seven layers
          give finer-grained vocabulary for reasoning about where things live and break.
          &ldquo;It&rsquo;s a Layer 2 problem&rdquo; instantly scopes a fault to one link, MAC
          addressing, and switches; &ldquo;an L7 load balancer&rdquo; instantly tells you it reads
          HTTP. TCP/IP&rsquo;s four layers are truer to the code that runs, but its single
          &ldquo;application layer&rdquo; flattens distinctions (session vs representation vs
          application logic) that turn out to be useful when systems fail —{" "}
          <Link href="/layers/session/" className="underline underline-offset-2">
            ask anyone whose users got logged out by a load balancer
          </Link>
          .
        </p>
        <div className="mt-6">
          <OsiTcpIpMap />
        </div>
        <p className="mt-4 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Textbooks split the difference: Kurose &amp; Ross and Tanenbaum teach a{" "}
          <strong>five-layer hybrid</strong> (application, transport, network, data link, physical)
          — TCP/IP&rsquo;s realism with the link layer usefully split in two. When an interviewer
          asks &ldquo;four, five, or seven?&rdquo;, the strong answer is that they&rsquo;re three
          maps of the same territory at different zoom levels: RFC 1122 describes the protocols, the
          five-layer model teaches them, and the seven-layer model names the failure modes.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Where real protocols refuse to fit</h2>
        <p className="mt-3 leading-relaxed">
          Treat the layers as a map, not a law of physics — the most instructive protocols are the
          ones that straddle boundaries:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed">
          <li>
            <strong>TLS</strong> encrypts representations (Layer 6) but manages handshakes and
            resumable sessions (Layer 5), riding on TCP (Layer 4).{" "}
            <Link href="/layers/presentation/" className="underline underline-offset-2">
              The site files it under Presentation
            </Link>{" "}
            — with a footnote, like everyone else.
          </li>
          <li>
            <strong>ARP</strong> glues Layer 3 addresses to Layer 2 addresses and belongs cleanly to
            neither — which is why this site stars it on the{" "}
            <Link href="/layers/data-link/" className="underline underline-offset-2">
              Data Link page
            </Link>
            .
          </li>
          <li>
            <strong>MPLS</strong> forwards on labels below IP but above Ethernet — engineers just
            call it &ldquo;Layer 2.5&rdquo; and move on.
          </li>
          <li>
            <strong>QUIC</strong> is a transport protocol (Layer 4 duties) implemented in user space
            over UDP, carrying TLS inside itself —{" "}
            <Link href="/layers/transport/" className="underline underline-offset-2">
              three layers&rsquo; jobs in one protocol
            </Link>
            .
          </li>
          <li>
            <strong>Tunnels</strong> (VPNs, VXLAN) put entire stacks inside single layers —{" "}
            <Link href="/modern/" className="underline underline-offset-2">
              encapsulation all the way down
            </Link>
            .
          </li>
        </ul>
        <Callout variant="insight" title="The model's real job">
          OSI doesn&rsquo;t describe what protocols <em>are</em>; it describes what jobs exist.
          Framing, addressing, routing, reliability, sessions, representation, application semantics
          — every network needs these jobs done by <em>something</em>. The model&rsquo;s power is
          letting you ask &ldquo;who does this job here?&rdquo; of any system you meet, including
          ones that hadn&rsquo;t been invented when the model was written.
        </Callout>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl font-bold">Check your understanding</h2>
        <Quiz
          questions={[
            {
              q: "Why did TCP/IP defeat the OSI protocol suite?",
              options: [
                "It was technically superior in every layer",
                "It was free, already running, and good enough — while OSI was complete but late",
                "Governments mandated TCP/IP from the start",
              ],
              answer: 1,
              explanation:
                "Open specs, a free BSD implementation, and 'rough consensus and running code' beat a more complete architecture that shipped too slowly. Governments actually mandated OSI (GOSIP) — and it still lost.",
            },
            {
              q: "The OSI session and presentation layers are 'missing' from TCP/IP. Where did their jobs go?",
              options: [
                "They were never needed",
                "Into hardware",
                "Into applications and libraries — TLS, cookies, serialization formats",
              ],
              answer: 2,
              explanation:
                "The jobs survived: TLS handles representation and session resumption, cookies and tokens manage dialogues, JSON/protobuf handle serialization. TCP/IP just doesn't give those jobs their own named layers.",
            },
          ]}
        />
      </section>
    </main>
  );
}
