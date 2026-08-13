import { ArrowLeft } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import {
  BROWSE_NAV_GROUPS,
  BROWSE_NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
  type SiteNavItem,
} from '../data/site-navigation';

interface SiteHeaderProps {
  actions?: ReactNode;
  onNavigate?: () => void;
  sticky?: boolean;
  focus?: { exitTo: string; exitLabel: string };
}

function destinationClass({ isActive }: { isActive: boolean }) {
  return `inline-flex h-16 min-w-11 items-center justify-center whitespace-nowrap px-1 text-sm transition-colors duration-150 ${
    isActive ? 'text-white' : 'text-white/50 hover:text-white'
  }`;
}

function menuDestinationClass({ isActive }: { isActive: boolean }) {
  return `flex min-h-11 items-center rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
    isActive ? 'bg-white/[0.08] text-white' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
  }`;
}

function DestinationLink({
  item,
  className,
  onNavigate,
}: {
  item: SiteNavItem;
  className: ({ isActive }: { isActive: boolean }) => string;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={item.to}
      reloadDocument={item.reloadDocument}
      className={className}
      onClick={onNavigate}
    >
      {item.label}
    </NavLink>
  );
}

export function SiteHeader({ actions, onNavigate, sticky = true, focus }: SiteHeaderProps) {
  const location = useLocation();
  const browseRef = useRef<HTMLDetailsElement>(null);
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    browseRef.current?.removeAttribute('open');
    menuRef.current?.removeAttribute('open');
  }, [location.pathname, location.search]);

  const closeMenus = () => {
    browseRef.current?.removeAttribute('open');
    menuRef.current?.removeAttribute('open');
    onNavigate?.();
  };

  const browseGroups = BROWSE_NAV_GROUPS.map((group) => ({
    ...group,
    items: BROWSE_NAV_ITEMS.filter((item) => item.group === group.id && item.menu),
  })).filter((group) => group.items.length > 0);

  return (
    <>
      <a
        href="#main-content"
        className="skip-link fixed left-4 top-3 z-60 inline-flex min-h-11 -translate-y-16 items-center rounded-md bg-white px-3 py-2 text-sm font-medium text-black transition-transform duration-150"
      >
        Skip to content
      </a>
      <header
        className={`${sticky ? 'sticky top-0' : 'relative'} z-50 isolate border-b border-white/[0.08] bg-black/95`}
      >
        <div className="relative mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4 md:px-6">
          <NavLink
            to="/"
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-md focus-visible:ring-1 focus-visible:ring-white/50"
          >
            <span className="text-base font-bold tracking-tight text-white">SWE Prep</span>
            <span className="hidden text-xs text-white/60 sm:inline">/ Learning OS</span>
          </NavLink>

          {focus ? (
            <Link
              to={focus.exitTo}
              aria-label={focus.exitLabel}
              className="ml-2 inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-white/55 transition-colors hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sm:hidden">Exit</span>
              <span className="hidden sm:inline">{focus.exitLabel}</span>
            </Link>
          ) : (
            <nav
              aria-label="Primary"
              className="absolute left-1/2 hidden min-w-0 -translate-x-1/2 items-center justify-center gap-4 lg:flex xl:gap-6"
            >
              {PRIMARY_NAV_ITEMS.map((item) => (
                <DestinationLink
                  key={item.id}
                  item={item}
                  className={destinationClass}
                  onNavigate={onNavigate}
                />
              ))}
              <details ref={browseRef} className="group relative">
                <summary className="flex h-16 cursor-pointer list-none items-center gap-1 px-1 text-sm text-white/50 transition-colors hover:text-white">
                  Browse
                  <span
                    aria-hidden="true"
                    className="text-[10px] transition-transform duration-150 group-open:rotate-180"
                  >
                    ▾
                  </span>
                </summary>
                <div className="absolute left-1/2 top-full z-50 mt-1 grid w-[36rem] -translate-x-1/2 grid-cols-2 gap-4 rounded-xl border border-white/10 bg-black p-3">
                  {browseGroups.map((group) => (
                    <div key={group.id}>
                      <p className="px-3 pb-1 pt-2 text-[11px] font-medium text-white/50">
                        {group.label}
                      </p>
                      {group.items.map((item) => (
                        <DestinationLink
                          key={item.id}
                          item={item}
                          className={menuDestinationClass}
                          onNavigate={closeMenus}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </details>
            </nav>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-1">{actions}</div>

          {!focus && (
            <details ref={menuRef} className="group relative lg:hidden">
              <summary className="flex h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-1 rounded-md border border-white/15 px-3 text-xs font-medium text-white transition-colors hover:border-white/30 hover:bg-white/[0.05]">
                Menu
                <span
                  aria-hidden="true"
                  className="text-[10px] transition-transform duration-150 group-open:rotate-180"
                >
                  ▾
                </span>
              </summary>
              <nav
                aria-label="Compact"
                className="absolute right-0 top-full z-50 mt-2 max-h-[calc(100vh-5rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-xl border border-white/10 bg-black p-2"
              >
                <p className="px-3 pb-1 pt-2 text-[11px] font-medium text-white/50">Go</p>
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <DestinationLink
                    key={item.id}
                    item={item}
                    className={menuDestinationClass}
                    onNavigate={closeMenus}
                  />
                ))}
                <div className="mx-3 my-2 border-t border-white/[0.08]" />
                {browseGroups.map((group) => (
                  <div key={group.id}>
                    <p className="px-3 pb-1 pt-2 text-[11px] font-medium text-white/50">
                      {group.label}
                    </p>
                    {group.items.map((item) => (
                      <DestinationLink
                        key={item.id}
                        item={item}
                        className={menuDestinationClass}
                        onNavigate={closeMenus}
                      />
                    ))}
                  </div>
                ))}
              </nav>
            </details>
          )}
        </div>
      </header>
    </>
  );
}
