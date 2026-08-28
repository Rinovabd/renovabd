/** Ribbon Modernism: the studio rail acts like an editorial production index, compact but unambiguous. */
import { Boxes, ChartNoAxesCombined, FolderOpen, LayoutPanelTop, LogOut, PackagePlus, Settings, ShoppingBag, Sparkles } from "lucide-react";
import { BrandMark } from "./BrandMark";

export type AdminView = "overview" | "catalogue" | "content" | "media" | "orders" | "settings";

const navItems: { id: AdminView; label: string; icon: typeof ChartNoAxesCombined }[] = [
  { id: "overview", label: "Overview", icon: ChartNoAxesCombined },
  { id: "catalogue", label: "Product library", icon: PackagePlus },
  { id: "content", label: "Site content", icon: LayoutPanelTop },
  { id: "media", label: "Media desk", icon: FolderOpen },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "settings", label: "Settings", icon: Settings },
];

type AdminSidebarProps = {
  active: AdminView;
  onChange: (view: AdminView) => void;
};

export function AdminSidebar({ active, onChange }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand"><BrandMark compact /><span>STUDIO</span></div>
      <div className="admin-sidebar-label">Workspace</div>
      <nav>
        {navItems.map((item) => {
          const Icon = item.icon;
          return <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => onChange(item.id)}><Icon size={18} />{item.label}</button>;
        })}
      </nav>
      <div className="admin-sidebar-foot">
        <a href="/"><Sparkles size={17} />View shop</a>
        <button onClick={() => window.alert("Session logout is connected to the new secure Worker session endpoint once deployment is complete.")}><LogOut size={17} />Sign out</button>
      </div>
    </aside>
  );
}
