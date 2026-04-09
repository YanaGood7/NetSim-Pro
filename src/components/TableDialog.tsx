import { useI18n } from "@/hooks/useI18n";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MacTableEntry, RoutingTableEntry } from "@/types/network";

interface TableDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  type: "mac" | "routing";
  macEntries?: MacTableEntry[];
  routingEntries?: (RoutingTableEntry | null)[];
}

export default function TableDialog({
  open,
  onClose,
  title,
  type,
  macEntries = [],
  routingEntries = [],
}: TableDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg glass-strong neon-border">
        <DialogHeader>
          <DialogTitle className="font-display text-primary neon-text">{title}</DialogTitle>
        </DialogHeader>

        {type === "mac" ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead className="text-xs font-display text-primary">{t("table.port")}</TableHead>
                <TableHead className="text-xs font-display text-primary">{t("table.mac")}</TableHead>
                <TableHead className="text-xs font-display text-primary">{t("table.device_col")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {macEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">
                    {t("table.no_entries")}
                  </TableCell>
                </TableRow>
              ) : (
                macEntries.map((entry, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="font-mono text-xs text-neon-cyan">{entry.port}</TableCell>
                    <TableCell className="font-mono text-xs">{entry.macAddress}</TableCell>
                    <TableCell className="text-xs">{entry.deviceName}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead className="text-xs font-display text-primary">{t("table.network")}</TableHead>
                <TableHead className="text-xs font-display text-primary">{t("table.mask")}</TableHead>
                <TableHead className="text-xs font-display text-primary">{t("table.next_hop")}</TableHead>
                <TableHead className="text-xs font-display text-primary">{t("table.interface")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routingEntries.filter(Boolean).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground text-sm">
                    {t("table.no_entries")}
                  </TableCell>
                </TableRow>
              ) : (
                routingEntries.filter(Boolean).map((entry, i) => (
                  <TableRow key={i} className="border-border/20">
                    <TableCell className="font-mono text-xs text-neon-cyan">{entry!.network}</TableCell>
                    <TableCell className="font-mono text-xs">{entry!.mask}</TableCell>
                    <TableCell className="font-mono text-xs text-neon-green">{entry!.nextHop}</TableCell>
                    <TableCell className="font-mono text-xs">{entry!.interface}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
