"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValueTable } from "@/components/shared/key-value-table";

export function ParamsTab() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const setParams = useRequestStore((s) => s.setParams);

  return (
    <div className="p-4">
      <KeyValueTable
        rows={params}
        onChange={setParams}
        keyPlaceholder="parameter"
        valuePlaceholder="value"
        addLabel="Add Parameter"
        autoGuessType={true}
      />
    </div>
  );
}
