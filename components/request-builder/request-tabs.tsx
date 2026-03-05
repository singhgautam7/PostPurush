"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParamsTab } from "./params-tab";
import { HeadersTab } from "./headers-tab";
import { BodyTab } from "./body-tab";
import { useRequestStore } from "@/store/request-store";
import { Badge } from "@/components/ui/badge";

export function RequestTabs() {
  const params = useRequestStore((s) => s.activeRequest.params);
  const headers = useRequestStore((s) => s.activeRequest.headers);

  const activeParamCount = params.filter((p) => p.key).length;
  const activeHeaderCount = headers.filter((h) => h.key).length;

  return (
    <Tabs defaultValue="params" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-4 h-10">
        <TabsTrigger
          value="params"
          className="relative rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-indigo-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Params
          {activeParamCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-indigo-500/20 text-indigo-400">
              {activeParamCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="relative rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-indigo-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Headers
          {activeHeaderCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-indigo-500/20 text-indigo-400">
              {activeHeaderCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="relative rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-indigo-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Body
        </TabsTrigger>
      </TabsList>
      <TabsContent value="params" className="mt-0">
        <ParamsTab />
      </TabsContent>
      <TabsContent value="headers" className="mt-0">
        <HeadersTab />
      </TabsContent>
      <TabsContent value="body" className="mt-0">
        <BodyTab />
      </TabsContent>
    </Tabs>
  );
}
