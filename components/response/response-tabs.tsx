"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyView } from "./body-view";
import { HeadersView } from "./headers-view";
import { useResponseStore } from "@/store/response-store";
import { Badge } from "@/components/ui/badge";

export function ResponseTabs() {
  const response = useResponseStore((s) => s.response);

  const headerCount = response ? Object.keys(response.headers).length : 0;

  return (
    <Tabs defaultValue="body" className="w-full h-full flex flex-col">
      <TabsList className="w-full justify-start rounded-none border-b border-border/50 bg-transparent px-4 h-10 shrink-0">
        <TabsTrigger
          value="body"
          className="relative rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-indigo-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Body
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="relative rounded-none border-b-2 border-transparent px-4 pb-2 pt-2 font-medium text-muted-foreground transition-all data-[state=active]:border-indigo-500 data-[state=active]:text-foreground data-[state=active]:shadow-none"
        >
          Headers
          {headerCount > 0 && (
            <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-indigo-500/20 text-indigo-400">
              {headerCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="body" className="mt-0 flex-1 overflow-hidden">
        <BodyView />
      </TabsContent>
      <TabsContent value="headers" className="mt-0 flex-1 overflow-hidden">
        <HeadersView />
      </TabsContent>
    </Tabs>
  );
}
