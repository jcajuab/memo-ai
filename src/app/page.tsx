import { AppSidebar } from "@/components/app-sidebar";
import { MemoCaptionsShell } from "@/components/memo/memo-captions-shell";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />
          <span className="text-sm font-medium text-muted-foreground">
            Memo.ai · Transcription Workspace
          </span>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden">
          <MemoCaptionsShell />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
