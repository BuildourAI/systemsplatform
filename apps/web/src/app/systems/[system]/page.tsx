import { notFound } from "next/navigation";
import Link from "next/link";
import { catalog, getSystem, itemsForSystem, groupByKind } from "@/lib/catalog";
import { SystemShop } from "@/components/system-shop";

export function generateStaticParams() {
  return catalog.systems
    .filter((system) => system.status === "live" && system.browsable !== false)
    .map((system) => ({ system: system.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ system: string }> }) {
  const { system: systemId } = await params;
  const system = getSystem(systemId);
  return { title: system ? system.name : "System" };
}

export default async function SystemPage({ params }: { params: Promise<{ system: string }> }) {
  const { system: systemId } = await params;
  const system = getSystem(systemId);

  if (!system || system.status !== "live" || system.browsable === false) notFound();

  const groups = groupByKind(itemsForSystem(system.id));

  return (
    <>
      <div className="system-hero">
        <div className="shell">
          <p className="breadcrumb">
            <Link href="/systems">All systems</Link> <span aria-hidden="true">/</span> {system.name}
          </p>
          <h1>{system.name}</h1>
          <p className="lede">{system.description}</p>
        </div>
      </div>

      <div className="shell">
        <SystemShop system={system} groups={groups} />
      </div>
    </>
  );
}
