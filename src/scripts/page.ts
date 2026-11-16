// Clever Land homepage: translation switcher (signature), programme tabs (desktop), mobile menu.
// Without JS every caption shows English, every programme is open, the nav shows as a row.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
type Lang = "en" | "es" | "de";

/* 1. Translation switcher: swaps every [data-gloss] caption on the page. */
function initSwitcher(): void {
  const group = document.querySelector<HTMLElement>("[data-switcher]");
  if (!group) return;
  const buttons = Array.from(group.querySelectorAll<HTMLButtonElement>("button[data-lang]"));
  const captions = Array.from(document.querySelectorAll<HTMLElement>("[data-gloss]"));

  const swap = (el: HTMLElement, lang: Lang): void => {
    const next = el.dataset[lang];
    if (!next) return;
    if (reduce.matches) {
      el.textContent = next;
      el.lang = lang;
      return;
    }
    el.classList.add("is-leaving");
    window.setTimeout(() => {
      el.textContent = next;
      el.lang = lang;
      el.classList.remove("is-leaving");
      el.classList.add("is-entering");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove("is-entering")));
    }, 150);
  };

  const select = (lang: Lang): void => {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    captions.forEach((c) => swap(c, lang));
  };

  buttons.forEach((b) => b.addEventListener("click", () => {
    if (b.getAttribute("aria-pressed") === "true") return;
    select(b.dataset.lang as Lang);
  }));
}

/* 2. Programme tabs: desktop only (CSS hides the tab list below 64rem and shows all entries). */
function initTabs(): void {
  const root = document.querySelector<HTMLElement>("[data-tabs]");
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>("[data-panel]"));
  const indicator = root.querySelector<HTMLElement>(".programs__indicator");
  const desktop = window.matchMedia("(min-width: 64rem)");

  const moveIndicator = (tab: HTMLElement): void => {
    if (!indicator) return;
    indicator.style.transform = `translateY(${tab.offsetTop}px)`;
    indicator.style.height = `${tab.offsetHeight}px`;
  };

  const activate = (id: string, focus = false): void => {
    tabs.forEach((t) => {
      const on = t.dataset.program === id;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) {
        moveIndicator(t);
        if (focus) t.focus();
      }
    });
    panels.forEach((p) => {
      const on = p.dataset.panel === id;
      const was = p.classList.contains("is-active");
      p.classList.toggle("is-active", on);
      if (on && !was && !reduce.matches) {
        p.classList.add("is-switching");
        p.addEventListener("animationend", () => p.classList.remove("is-switching"), { once: true });
      }
    });
  };

  const syncRoles = (): void => {
    panels.forEach((p) => {
      if (desktop.matches) {
        p.setAttribute("role", "tabpanel");
        p.setAttribute("aria-labelledby", `tab-${p.dataset.panel}`);
      } else {
        p.removeAttribute("role");
        p.setAttribute("aria-labelledby", `title-${p.dataset.panel}`);
      }
    });
    const current = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
    if (current) moveIndicator(current);
  };

  tabs.forEach((t, i) => {
    t.addEventListener("click", () => activate(t.dataset.program ?? ""));
    t.addEventListener("keydown", (e) => {
      const keys: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      let next = -1;
      if (e.key in keys) next = (i + keys[e.key] + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      if (next < 0) return;
      e.preventDefault();
      activate(tabs[next].dataset.program ?? "", true);
    });
  });

  // Audience links in the hero open the matching programme.
  document.querySelectorAll<HTMLAnchorElement>("a[data-program]").forEach((a) => {
    a.addEventListener("click", () => activate(a.dataset.program ?? ""));
  });

  desktop.addEventListener("change", syncRoles);
  root.classList.add("is-ready");
  syncRoles();
}

/* 3. Mobile menu: button toggles the nav panel; Escape and anchor clicks close it. */
function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (!toggle || !nav) return;
  const set = (open: boolean): void => {
    toggle.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      set(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 64rem)").addEventListener("change", () => set(false));
}

initSwitcher();
initTabs();
initMenu();
