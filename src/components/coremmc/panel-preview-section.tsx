'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/use-app-store';
import { useSiteData } from '@/contexts/site-data-context';
import {
  Terminal,
  FolderOpen,
  Plug,
  Shield,
  Activity,
  Settings,
  ChevronRight,
  Server,
  Cpu,
  HardDrive,
  Clock,
} from 'lucide-react';

const panelFeatures = [
  {
    id: 'shell',
    icon: Terminal,
    title: 'Shell Access',
    description: 'Manage your server directly via our custom Shell system. No need for any third-party tools — full root access built in.',
    accent: '#6366f1',
    panelContent: 'shell',
  },
  {
    id: 'filemanager',
    icon: FolderOpen,
    title: 'File Manager',
    description: 'Upload, edit, and manage all your server files through an intuitive drag-and-drop interface right in your browser.',
    accent: '#22c55e',
    panelContent: 'files',
  },
  {
    id: 'plugins',
    icon: Plug,
    title: 'Plugin Manager',
    description: 'Install and manage plugins or mods in a single click. Browse our curated library of 500+ community favorites.',
    accent: '#f59e0b',
    panelContent: 'plugins',
  },
  {
    id: 'ddos',
    icon: Shield,
    title: 'DDoS Console',
    description: 'Real-time DDoS attack monitoring and mitigation. Configure custom firewall rules and view live traffic analytics.',
    accent: '#ef4444',
    panelContent: 'ddos',
  },
  {
    id: 'console',
    icon: Activity,
    title: 'Live Console',
    description: 'View real-time server logs, execute commands, and monitor resource usage with live auto-refreshing charts.',
    accent: '#a855f7',
    panelContent: 'console',
  },
];

/* Simulated panel UI rendered as styled divs (no real screenshot needed) */
function PanelMock({ activeId }: { activeId: string }) {
  const feature = panelFeatures.find((f) => f.id === activeId);
  const accent = feature?.accent || '#6366f1';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeId}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full rounded-lg overflow-hidden border border-white/[0.08]"
        style={{ background: 'linear-gradient(180deg, #0d0d14 0%, #0a0a10 100%)' }}
      >
        {/* Panel top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]/80" />
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]/80" />
            <div className="w-3 h-3 rounded-full bg-[#22c55e]/80" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-[11px] text-white/50 font-mono">panel.coremmc.cloud — Pterodactyl</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
            <span className="text-[10px] text-white/50 font-mono">Online</span>
          </div>
        </div>

        {/* Panel sidebar + content */}
        <div className="flex min-h-[260px] sm:min-h-[320px] md:min-h-[380px]">
          {/* Sidebar */}
          <div className="w-[180px] shrink-0 border-r border-white/[0.06] bg-white/[0.01] hidden sm:block">
            <div className="p-3 space-y-0.5">
              {['Dashboard', 'Servers', 'Users', 'Nodes', 'Locations', 'Mounts', 'API Keys', 'Audits'].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`px-2.5 py-1.5 rounded text-[11px] font-medium ${
                      i === 1
                        ? 'text-white/90 bg-white/[0.06]'
                        : 'text-white/50 hover:text-white/70'
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </div>

          {/* Main content area */}
          <div className="flex-1 p-4">
            {activeId === 'shell' && <ShellContent accent={accent} />}
            {activeId === 'filemanager' && <FilesContent accent={accent} />}
            {activeId === 'plugins' && <PluginsContent accent={accent} />}
            {activeId === 'ddos' && <DdosContent accent={accent} />}
            {activeId === 'console' && <ConsoleContent accent={accent} />}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ShellContent({ accent }: { accent: string }) {
  return (
    <div className="font-mono text-[11px] space-y-1">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="size-3.5" style={{ color: accent }} />
        <span className="text-white/60 font-sans text-xs font-medium">Server Shell — Minecraft AMD Fox</span>
      </div>
      {[
        { text: '$ cd /home/container', color: 'text-[#22c55e]' },
        { text: '$ ls -la', color: 'text-[#22c55e]' },
        { text: 'drwxr-xr-x  4 container container 4096 Jan 15 08:30 .', color: 'text-white/40' },
        { text: 'drwxr-xr-x  2 container container 4096 Jan 15 08:30 plugins', color: 'text-white/40' },
        { text: 'drwxr-xr-x  3 container container 4096 Jan 15 08:30 world', color: 'text-white/40' },
        { text: '-rw-r--r--  1 container container 1247 Jan 15 08:30 server.properties', color: 'text-white/40' },
        { text: '$ screen -r mc-server', color: 'text-[#22c55e]' },
        { text: '[08:30:15] [INFO] Starting minecraft server version 1.21.4', color: 'text-white/50' },
        { text: '[08:30:16] [INFO] Loading properties', color: 'text-white/50' },
        { text: '[08:30:16] [INFO] Default game type: SURVIVAL', color: 'text-white/50' },
        { text: '[08:30:17] [INFO] Generating keypair', color: 'text-white/50' },
        { text: '[08:30:18] [INFO] Starting Minecraft server on *:25565', color: 'text-[#22c55e]' },
        { text: '[08:30:18] [INFO] Done (3.247s)! For help, type "help"', color: 'text-[#22c55e]/80' },
        { text: '$ _', color: 'text-[#22c55e]' },
      ].map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.06 }}
          className={line.color}
        >
          {line.text}
        </motion.div>
      ))}
    </div>
  );
}

function FilesContent({ accent }: { accent: string }) {
  const files = [
    { name: 'server.properties', size: '1.2 KB', type: 'file' },
    { name: 'world/', size: '—', type: 'folder' },
    { name: 'plugins/', size: '—', type: 'folder' },
    { name: 'logs/', size: '—', type: 'folder' },
    { name: 'server.jar', size: '48.2 MB', type: 'file' },
    { name: 'eula.txt', size: '0.2 KB', type: 'file' },
    { name: 'ops.json', size: '0.4 KB', type: 'file' },
    { name: 'whitelist.json', size: '0.1 KB', type: 'file' },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <FolderOpen className="size-3.5" style={{ color: accent }} />
        <span className="text-white/60 text-xs font-medium">/home/container</span>
      </div>
      {files.map((f, i) => (
        <motion.div
          key={f.name}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-white/[0.03] group"
        >
          <div className="flex items-center gap-2">
            {f.type === 'folder' ? (
              <FolderOpen className="size-3.5 text-[#f59e0b]/70" />
            ) : (
              <div className="size-3.5 rounded-sm bg-white/[0.08] flex items-center justify-center">
                <span className="text-[8px] text-white/40">F</span>
              </div>
            )}
            <span className="text-[11px] text-white/60 group-hover:text-white/80">{f.name}</span>
          </div>
          <span className="text-[10px] text-white/50 font-mono">{f.size}</span>
        </motion.div>
      ))}
    </div>
  );
}

function PluginsContent({ accent }: { accent: string }) {
  const plugins = [
    { name: 'EssentialsX', version: '2.20.1', installed: true },
    { name: 'WorldEdit', version: '7.3.0', installed: true },
    { name: 'LuckPerms', version: '5.4.108', installed: true },
    { name: 'Vault', version: '1.7.3', installed: true },
    { name: 'ProtocolLib', version: '5.1.0', installed: false },
    { name: 'SkinsRestorer', version: '15.0.8', installed: false },
  ];
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Plug className="size-3.5" style={{ color: accent }} />
        <span className="text-white/60 text-xs font-medium">Plugin Manager</span>
      </div>
      {plugins.map((p, i) => (
        <motion.div
          key={p.name}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="flex items-center justify-between px-2.5 py-2 rounded bg-white/[0.02] border border-white/[0.04]"
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold"
              style={{ backgroundColor: accent + '20', color: accent }}
            >
              {p.name[0]}
            </div>
            <div>
              <div className="text-[11px] text-white/70">{p.name}</div>
              <div className="text-[9px] text-white/50">v{p.version}</div>
            </div>
          </div>
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${p.installed ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-white/5 text-white/50'}`}>
            {p.installed ? 'Installed' : 'Available'}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function DdosContent({ accent }: { accent: string }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="size-3.5" style={{ color: accent }} />
        <span className="text-white/60 text-xs font-medium">DDoS Protection — Live</span>
      </div>
      {/* Fake chart bars */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/50 w-10">Inbound</span>
          <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '18%' }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: accent, opacity: 0.7 }}
            />
          </div>
          <span className="text-[9px] text-white/40 font-mono w-12 text-right">1.2 Gbps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/50 w-10">Filtered</span>
          <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full rounded-full bg-[#22c55e]/60"
            />
          </div>
          <span className="text-[9px] text-white/40 font-mono w-12 text-right">4.8 Gbps</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-white/50 w-10">Clean</span>
          <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '28%' }}
              transition={{ duration: 1, delay: 0.6 }}
              className="h-full rounded-full"
              style={{ backgroundColor: accent, opacity: 0.5 }}
            />
          </div>
          <span className="text-[9px] text-white/40 font-mono w-12 text-right">1.8 Gbps</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: 'Status', value: 'Protected' },
          { label: 'Attacks Today', value: '3 Blocked' },
          { label: 'Uptime', value: '99.98%' },
        ].map((s) => (
          <div key={s.label} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
            <div className="text-[8px] text-white/50 uppercase">{s.label}</div>
            <div className="text-[11px] text-white/70 font-medium mt-0.5">{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConsoleContent({ accent }: { accent: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="size-3.5" style={{ color: accent }} />
        <span className="text-white/60 text-xs font-medium">Live Console</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="text-[9px] text-white/50">Streaming</span>
        </div>
      </div>
      {/* Resource stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { icon: Cpu, label: 'CPU', value: '12%', color: '#6366f1' },
          { icon: MemoryStick, label: 'RAM', value: '4.2 / 6 GB', color: '#22c55e' },
          { icon: HardDrive, label: 'Disk', value: '18 / 45 GB', color: '#f59e0b' },
        ].map((s) => (
          <div key={s.label} className="p-2 rounded bg-white/[0.02] border border-white/[0.04]">
            <s.icon className="size-3 mb-1" style={{ color: s.color }} />
            <div className="text-[9px] text-white/50">{s.label}</div>
            <div className="text-[11px] text-white/70 font-mono">{s.value}</div>
          </div>
        ))}
      </div>
      {/* Log lines */}
      <div className="font-mono text-[10px] space-y-0.5 max-h-[160px] overflow-hidden">
        {[
          { t: '08:30:18', m: '[Server] Done (3.247s)! For help, type "help"', c: 'text-[#22c55e]/70' },
          { t: '08:30:19', m: '[Server] Preparing level "world"', c: 'text-white/40' },
          { t: '08:30:22', m: '[Server] Preparing start region for dimension minecraft:overworld', c: 'text-white/40' },
          { t: '08:30:25', m: '[Server] Time elapsed: 3287 ms', c: 'text-white/40' },
          { t: '08:30:26', m: '[Server] Player joined: Steve', c: 'text-[#6366f1]/70' },
          { t: '08:30:28', m: '[CoreProtect] Player Steve placed block at 120, 64, -340', c: 'text-white/50' },
          { t: '08:30:30', m: '[Essentials] Player Steve used /home', c: 'text-white/50' },
        ].map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.08 }}
            className={l.c}
          >
            <span className="text-white/20">[{l.t}]</span> {l.m}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MemoryStick(props: React.SVGProps<SVGSVGElement> & { size?: string | number }) {
  const { size, ...rest } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      <rect width="20" height="8" x="2" y="2" rx="1" />
      <path d="M6 10v12" /><path d="M18 10v12" /><path d="M6 14h12" />
    </svg>
  );
}

export function PanelPreviewSection() {
  const [activeTab, setActiveTab] = useState('shell');
  const navigate = useAppStore((s) => s.navigate);
  const { categories } = useSiteData();
  const activeFeature = panelFeatures.find((f) => f.id === activeTab)!;

  if (categories.length === 0) return null;

  return (
    <section id="panel-preview" className="relative py-20 md:py-28 overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute top-1/3 right-0 w-96 h-96 max-w-[100vw] rounded-full bg-[#6366f1]/[0.04] blur-[140px] animate-float-1 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-[#a855f7]/[0.03] blur-[120px] animate-float-2 pointer-events-none" />

      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px stat-line-shimmer opacity-25" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14 md:mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-6"
          >
            <Settings className="size-3.5 text-[#6366f1]" />
            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Our Panel</span>
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight">
            Experience Our <span className="gradient-text-animated">Platform</span>
          </h2>
          <p className="mt-4 text-white/40 text-base md:text-lg max-w-lg mx-auto">
            Discover the powerful features that make our panel the perfect choice for managing your servers
          </p>
        </motion.div>

        {/* Panel Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:items-stretch">
          {/* Left — Feature tabs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3"
            role="tablist"
            aria-label="Panel features"
          >
            {panelFeatures.map((feature) => {
              const isActive = activeTab === feature.id;
              const Icon = feature.icon;
              return (
                <motion.button
                  key={feature.id}
                  onClick={() => setActiveTab(feature.id)}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-tabpanel-${feature.id}`}
                  id={`panel-tab-${feature.id}`}
                  tabIndex={isActive ? 0 : -1}
                  className={`relative text-left rounded-xl p-4 sm:p-5 transition-all duration-300 overflow-hidden group ${
                    isActive
                      ? 'border border-white/10'
                      : 'border border-white/[0.04] hover:border-white/10'
                  }`}
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${feature.accent}12 0%, transparent 60%)`
                      : 'rgba(255,255,255,0.01)',
                  }}
                >
                  {/* Active accent line at bottom */}
                  {isActive && (
                    <motion.div
                      layoutId="panel-accent-line"
                      className="absolute bottom-0 left-0 right-0 h-[2px]"
                      style={{ background: `linear-gradient(90deg, ${feature.accent}80, ${feature.accent}20)` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className="p-2.5 rounded-lg shrink-0 transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? feature.accent + '20' : 'rgba(255,255,255,0.04)',
                        boxShadow: isActive ? `0 0 20px ${feature.accent}15` : 'none',
                      }}
                    >
                      <Icon
                        className="size-4 sm:size-5 transition-colors duration-300"
                        style={{ color: isActive ? feature.accent : 'rgba(255,255,255,0.35)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-semibold text-white/90">
                          {feature.title}
                        </h3>
                        {isActive && (
                          <ChevronRight
                            className="size-3.5 hidden sm:block"
                            style={{ color: feature.accent }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 leading-relaxed line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Right — Panel mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
            role="tabpanel"
            id={`panel-tabpanel-${activeTab}`}
            aria-labelledby={`panel-tab-${activeTab}`}
          >
            {/* Glow behind panel */}
            <div
              className="absolute -inset-4 rounded-2xl blur-2xl opacity-30 pointer-events-none transition-colors duration-500"
              style={{ background: `radial-gradient(ellipse at center, ${activeFeature.accent}15, transparent 70%)` }}
            />

            <div className="relative">
              <PanelMock activeId={activeTab} />

              {/* Feature label below panel */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 flex items-center gap-3"
                >
                  <Server className="size-4 text-white/20" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-white/80">{activeFeature.title}</h3>
                    <p className="text-xs text-white/50 mt-0.5 max-w-md">{activeFeature.description}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 md:mt-16 relative overflow-hidden rounded-xl border border-white/[0.06] p-6 sm:p-8 md:p-10"
          style={{
            background: `linear-gradient(135deg, ${activeFeature.accent}10 0%, rgba(18,18,26,0.8) 50%, ${activeFeature.accent}08 100%)`,
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Ready to try it yourself?
              </h3>
              <p className="text-sm text-white/40 mt-1">
                Get started with instant setup and experience the panel in under 60 seconds.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.a
                href="/minecraft-intel"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm text-black inline-block"
                style={{ backgroundColor: activeFeature.accent }}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault();
                  const sorted = [...categories].sort((a, b) => a.order - b.order);
                  const first = sorted[0];
                  if (first) navigate('category', first.slug);
                }}
              >
                Get Started
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 rounded-lg font-semibold text-sm text-white/70 border border-white/10 hover:border-white/20 hover:text-white transition-colors"
                onClick={() => {
                  document.getElementById('popular-plans')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                View Plans
              </motion.button>
            </div>
          </div>

          {/* Background decorative element */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle, ${activeFeature.accent}, transparent 70%)` }} />
        </motion.div>
      </div>

      {/* Bottom shimmer line */}
      <div className="absolute bottom-0 left-0 right-0 h-px stat-line-shimmer opacity-20" />
    </section>
  );
}