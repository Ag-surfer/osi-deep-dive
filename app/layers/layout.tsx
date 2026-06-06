import { LayerNav } from "@/components/LayerNav";
import { MobileLayerBar } from "@/components/MobileLayerBar";

/** Two-column shell for all layer pages: sticky layer nav + content. */
export default function LayersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6">
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20">
          <LayerNav />
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <MobileLayerBar />
        {children}
      </main>
    </div>
  );
}
