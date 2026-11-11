import * as React from "react";
import Head from "next/head";
import {
  suUiHref,
  TopBar,
  MediaCard,
  MediaCards,
  Modal,
  Page,
  Window,
  Cover,
  Container,
  Panel,
  Label,
  Footer,
} from "../components/su";

// The React side of public/ui/v1/demo.html: the same components through the
// thin wrappers in components/su. Not linked from the site; it's a fixture
// for reviewing the library (and for the visual check once dotdev's build
// runs in CI).
const base = process.env.NEXT_PUBLIC_BASE_PATH || "";

const tools = [
  { title: "Artifacts Index", meta: "Tool · Historiography", image: `${base}/artifacts-index-preview.png`, href: "https://artifacts-index.surulere.dev" },
  { title: "Atlas: African states through time", meta: "Tool · Historiography", image: `${base}/map-tool-preview.png`, href: "#" },
  { title: "Archive 3D", meta: "Tool · Sensemaking", image: `${base}/archive-3d-preview.jpeg`, href: "#" },
  { title: "Fintech and the informal economy", meta: "Essay · Technology · 2024", image: `${base}/africa_fintech.jpg`, href: "#" },
];

export default function UiDemo() {
  const [view, setView] = React.useState<"cards" | "about">("cards");
  const [aboutOpen, setAboutOpen] = React.useState(false);
  // Index of the tool open in the large modal, or null.
  const [detail, setDetail] = React.useState<number | null>(null);
  const step = (by: number) => setDetail((i) => (i === null ? i : (i + by + tools.length) % tools.length));

  return (
    <>
      <Head>
        <title>UI v1 · React</title>
        <meta name="robots" content="noindex" />
        {/* next/head only keeps direct children on the client, so the links are
            written out here. In _document, <SuStyles base={base} /> works. */}
        <link rel="stylesheet" href={suUiHref("su-tokens.css", base)} />
        <link rel="stylesheet" href={suUiHref("su-components.css", base)} />
      </Head>
      <Page>
        <TopBar
          site="Components"
          navLabel="Views"
          items={[
            { label: "Cards", current: view === "cards", onClick: () => setView("cards") },
            { label: "About", onClick: () => setAboutOpen(true), track: "about" },
            { label: "Home", href: "/" },
          ]}
        />
        <Window variant="hero">
          <Container>
            <Panel>
              <Label>surulere.dev · UI v1 · React</Label>
              <h1>Same classes, from React</h1>
              <p>These wrappers render the markup in demo.html. The CSS is shared; React only owns state.</p>
              <button className="su-btn su-btn--primary" type="button" onClick={() => setAboutOpen(true)}>
                Open modal
              </button>
            </Panel>
          </Container>
        </Window>
        <Cover as="main">
          <Container>
            <Label as="h2">Tools and essays</Label>
            <MediaCards>
              {tools.map((t) => (
                <MediaCard
                  key={t.title}
                  title={t.title}
                  meta={t.meta}
                  image={t.image}
                  onClick={() => setDetail(tools.indexOf(t))}
                />
              ))}
              <MediaCard title="Contain variant" meta="Opens the modal" image={`${base}/suruleredotdev.png`} fit="contain" onClick={() => setAboutOpen(true)} />
            </MediaCards>
          </Container>
        </Cover>
        <Footer>surulere.dev · essays, tools and archives on African futures</Footer>
        <Modal
          open={aboutOpen}
          onClose={() => setAboutOpen(false)}
          title="About"
          footer={
            <button className="su-btn su-btn--primary" type="button" onClick={() => setAboutOpen(false)}>
              Done
            </button>
          }
        >
          <p>A native dialog: centred on desktop, docked to the bottom on phone.</p>
        </Modal>
        {detail !== null ? (
          <Modal
            size="lg"
            onClose={() => setDetail(null)}
            scrollKey={detail}
            title={
              <>
                Tool <span className="su-modal__count">{detail + 1} / {tools.length}</span>
              </>
            }
            actions={
              <>
                <button type="button" className="su-modal__cell" onClick={() => step(-1)} aria-label="Previous">
                  ‹ <span className="su-modal__cell-text">Prev</span>
                </button>
                <button type="button" className="su-modal__cell" onClick={() => step(1)} aria-label="Next">
                  <span className="su-modal__cell-text">Next</span> ›
                </button>
              </>
            }
          >
            <img src={tools[detail].image} alt="" style={{ display: "block", width: "100%", maxHeight: "60vh", objectFit: "contain" }} />
            <h2>{tools[detail].title}</h2>
            <p>{tools[detail].meta}</p>
            <a className="su-btn" href={tools[detail].href}>
              Open
            </a>
          </Modal>
        ) : null}
      </Page>
    </>
  );
}
