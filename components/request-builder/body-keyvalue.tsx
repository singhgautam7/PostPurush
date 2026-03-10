"use client";

import { useRequestStore } from "@/store/request-store";
import { KeyValueTable } from "@/components/shared/key-value-table";

export function BodyKeyValue() {
  const body = useRequestStore((s) => s.activeRequest.body);
  const setBody = useRequestStore((s) => s.setBody);

  const formData = body.formData || [];

  return (
    <div className="mt-4">
      <KeyValueTable
        rows={formData}
        onChange={(rows) => setBody({ ...body, formData: rows })}
        keyPlaceholder="key"
        valuePlaceholder="value"
        addLabel="Add Item"
        autoGuessType={true}
      />
    </div>
  );
}
