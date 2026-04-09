import { useI18n } from "@/hooks/useI18n";
import { Monitor, Waypoints, Router, Zap, Settings, Send, Table, Network, Cable, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function WelcomeDialog({ open, onClose }: WelcomeDialogProps) {
  const { t } = useI18n();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl mx-4 max-h-[92vh] rounded-2xl glass-strong neon-border flex flex-col overflow-hidden">
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 mb-5">
                <div className="p-3 rounded-xl bg-primary/10 neon-glow">
                  <Network className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground neon-text mb-2">
                {t("welcome.title")}
              </h2>
              <p className="text-sm text-primary font-display tracking-wider uppercase mb-4">
                {t("welcome.subtitle")}
              </p>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
                {t("welcome.desc")}
              </p>
            </div>

            {/* What is this? section */}
            <div className="mb-8 p-5 rounded-xl bg-secondary/20 border border-border/30">
              <h3 className="text-xs font-display font-semibold uppercase tracking-[0.15em] text-primary mb-3">
                {t("welcome.about_title")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {t("welcome.about_p1")}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("welcome.about_p2")}
              </p>
            </div>

            {/* Features grid */}
            <h3 className="text-xs font-display font-semibold uppercase tracking-[0.15em] text-primary mb-3">
              {t("welcome.features_title")}
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                { icon: <Monitor className="w-5 h-5" />, titleKey: "welcome.feature1_title", descKey: "welcome.feature1_desc" },
                { icon: <Settings className="w-5 h-5" />, titleKey: "welcome.feature2_title", descKey: "welcome.feature2_desc" },
                { icon: <Send className="w-5 h-5" />, titleKey: "welcome.feature3_title", descKey: "welcome.feature3_desc" },
                { icon: <Table className="w-5 h-5" />, titleKey: "welcome.feature4_title", descKey: "welcome.feature4_desc" },
                { icon: <Shield className="w-5 h-5" />, titleKey: "welcome.feature5_title", descKey: "welcome.feature5_desc" },
                { icon: <Save className="w-5 h-5" />, titleKey: "welcome.feature6_title", descKey: "welcome.feature6_desc" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-border/30 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-primary">{f.icon}</span>
                    <span className="text-sm font-semibold text-foreground">{t(f.titleKey)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
                </div>
              ))}
            </div>

            {/* Device types explained */}
            <h3 className="text-xs font-display font-semibold uppercase tracking-[0.15em] text-primary mb-3">
              {t("welcome.devices_title")}
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: <Monitor className="w-6 h-6" />, nameKey: "welcome.dev_pc_name", descKey: "welcome.dev_pc_desc", color: "neon-cyan" },
                { icon: <Waypoints className="w-6 h-6" />, nameKey: "welcome.dev_switch_name", descKey: "welcome.dev_switch_desc", color: "neon-green" },
                { icon: <Router className="w-6 h-6" />, nameKey: "welcome.dev_router_name", descKey: "welcome.dev_router_desc", color: "neon-orange" },
              ].map((d, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/30 bg-secondary/20 text-center">
                  <div className={`inline-flex p-3 rounded-lg mb-2 bg-${d.color}/10 text-${d.color}`}>
                    {d.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{t(d.nameKey)}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t(d.descKey)}</p>
                </div>
              ))}
            </div>

            {/* Quick start steps */}
            <h3 className="text-xs font-display font-semibold uppercase tracking-[0.15em] text-primary mb-3">
              {t("welcome.steps_title")}
            </h3>
            <div className="space-y-3 mb-8">
              {[1, 2, 3, 4, 5, 6].map((i) => {
                const step = t(`welcome.step${i}`);
                const detail = t(`welcome.step${i}_detail`);
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-secondary/15 border border-border/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center border border-primary/30 mt-0.5">
                      {i}
                    </span>
                    <div>
                      <p className="text-sm text-foreground font-medium">{step}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tips */}
            <div className="p-5 rounded-xl bg-neon-purple/5 border border-neon-purple/20 mb-6">
              <h3 className="text-xs font-display font-semibold uppercase tracking-[0.15em] text-accent mb-3">
                {t("welcome.tips_title")}
              </h3>
              <ul className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    {t(`welcome.tip${i}`)}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <Button
              onClick={onClose}
              className="w-full h-12 font-display text-sm tracking-wider uppercase neon-glow"
            >
              <Zap className="w-4 h-4 mr-2" />
              {t("welcome.start")}
            </Button>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
