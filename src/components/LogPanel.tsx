import { SimulationLog } from "@/types/network";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/hooks/useI18n";
import { Terminal } from "lucide-react";

interface LogPanelProps {
  logs: SimulationLog[];
}

export default function LogPanel({ logs }: LogPanelProps) {
  const { t } = useI18n();

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b border-border/50 flex items-center gap-2">
        <Terminal className="w-3 h-3 text-primary" />
        <h3 className="text-[10px] font-display font-semibold uppercase tracking-[0.15em] text-primary">
          {t("log.title")}
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {logs.length === 0 && (
            <p className="text-[10px] text-muted-foreground p-2 font-mono">{t("log.empty")}</p>
          )}
          {logs.map((log, i) => (
            <div
              key={i}
              className={`text-[10px] px-2 py-1 rounded font-mono leading-relaxed ${
                log.type === "error"
                  ? "text-destructive bg-destructive/5"
                  : log.type === "success"
                  ? "text-neon-green bg-neon-green/5"
                  : "text-muted-foreground"
              }`}
            >
              <span className="text-muted-foreground/40 mr-1">
                {log.timestamp.toLocaleTimeString()}
              </span>
              {log.message}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
