import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  LogOut,
  Plus,
  Shirt,
  Sparkles,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/lib/closet";

const navItems = [
  { label: "Início", to: "/dashboard", icon: Home },
  { label: "Closet", to: "/closet", icon: Shirt },
  { label: "Criar", to: "/looks", icon: Plus },
  { label: "Fiorella AI", to: "/ia", icon: Sparkles },
  { label: "Perfil", to: "/perfil", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const name = profile?.display_name || profile?.full_name || user?.email || "Você";
  const initial = name.charAt(0).toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const today = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })
    .format(new Date())
    .toUpperCase();

  return (
    <div className="fiorella-app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">F</span>fiorella
        </div>
        <p className="brand-caption">YOUR INTELLIGENT CLOSET</p>
        <nav>
          {navItems.map(({ label, to, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className={`nav-button ${pathname === to ? "is-active" : ""} ${label === "Criar" ? "create-nav" : ""}`}
            >
              <Icon size={19} />
              {label}
            </Link>
          ))}
          <Link
            to="/calendario"
            className={`nav-button ${pathname === "/calendario" ? "is-active" : ""}`}
          >
            <CalendarDays size={19} />
            Calendário
          </Link>
        </nav>
        <div className="sidebar-bottom">
          <Link to="/perfil" className="mini-profile">
            <span className="avatar">{initial}</span>
            <span>
              <b>{name}</b>
              <small>Meu perfil</small>
            </span>
            <ChevronRight size={16} />
          </Link>
          <button className="nav-button" onClick={handleSignOut}>
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">F</span>fiorella
          </div>
          <div className="date">{today}</div>
          <div className="top-actions">
            <button aria-label="Notificações" type="button">
              <Bell size={19} />
            </button>
            <span className="avatar">{initial}</span>
          </div>
        </header>
        {children}
      </main>

      <nav className="bottom-nav">
        {navItems.map(({ label, to, icon: Icon }) => (
          <Link key={label} to={to} className={pathname === to ? "is-active" : ""}>
            <span className={label === "Criar" ? "create-circle" : ""}>
              <Icon size={label === "Criar" ? 21 : 19} />
            </span>
            <small>{label}</small>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-flower">✦</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
