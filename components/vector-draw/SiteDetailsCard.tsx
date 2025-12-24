"use client";

import { HierarchySite } from "./types";

export function SiteDetailsCard({ site }: { site: HierarchySite | null }) {
  return (
    <div className="space-y-1 text-sm text-gray-700 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
      <div className="text-sm font-semibold text-gray-900">Selected Site</div>
      {site ? (
        <div className="text-gray-700 text-sm space-y-1">
          <div className="font-semibold text-gray-900">{site.name}</div>
          <div>{site.category}{site.subCategory ? ` › ${site.subCategory}` : ""}</div>
          <div className="text-xs">{site.org} · {site.region}</div>
          <div className="text-xs">{site.city || site.district || ""}</div>
        </div>
      ) : (
        <div className="text-xs text-gray-500">No site selected</div>
      )}
    </div>
  );
}
