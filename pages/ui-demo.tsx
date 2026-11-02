import * as React from "react";
import Head from "next/head";
import {
  suUiHref,
  TopBar,
  MediaCard,
  MediaCards,
  Sheet,
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
  const [sheetOpen, setSheetOpen] = React.useState(false);

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
            { label: "About", onClick: () => setSheetOpen(true), track: "about" },
            { label: "Home", href: "/" },
          ]}
        />
        <Window variant="hero">
          <Container>
            <Panel>
              <Label>surulere.dev · UI v1 · React</Label>
              <h1>Same classes, from React</h1>
              <p>These wrappers render the markup in demo.html. The CSS is shared; React only owns state.</p>
              <button className="su-btn su-btn--primary" type="button" onClick={() => setSheetOpen(true)}>
                Open sheet
              </button>
            </Panel>
          </Container>
        </Window>
        <Cover as="main">
          <Container>
            <Label as="h2">Tools and essays</Label>
            <MediaCards>
              {tools.map((t) => (
                <MediaCard key={t.title} {...t} />
              ))}
              <MediaCard title="Contain variant" meta="Opens the sheet" image={`${base}/suruleredotdev.png`} fit="contain" onClick={() => setSheetOpen(true)} />
            </MediaCards>
          </Container>
        </Cover>
        <Footer>surulere.dev · essays, tools and archives on African futures</Footer>
        <Sheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="About"
          footer={
            <button className="su-btn su-btn--primary" type="button" onClick={() => setSheetOpen(false)}>
              Done
            </button>
          }
        >
          <p>A native dialog: modal on desktop, bottom sheet on phone.</p>
        </Sheet>
      </Page>
    </>
  );
}
