const userPref = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
const currentTheme = localStorage.getItem("theme") ?? userPref;
document.documentElement.setAttribute("saved-theme", currentTheme);

const syncBodyThemeClass = (theme: "light" | "dark") => {
  document.body?.classList.remove("theme-dark", "theme-light");
  document.body?.classList.add(`theme-${theme}`);
};

const emitThemeChangeEvent = (theme: "light" | "dark") => {
  const event: CustomEventMap["themechange"] = new CustomEvent("themechange", {
    detail: { theme },
  });
  document.dispatchEvent(event);
};

const setupDarkmode = () => {
  // Sync body class with current theme on setup (runs after DOM is ready)
  const currentSavedTheme =
    (document.documentElement.getAttribute("saved-theme") as "light" | "dark") ?? "light";
  syncBodyThemeClass(currentSavedTheme);

  const themeAnimation = (e: MouseEvent, callback: () => void) => {
    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    );

    document.documentElement.style.setProperty("--x", `${x}px`);
    document.documentElement.style.setProperty("--y", `${y}px`);
    document.documentElement.style.setProperty("--r", `${endRadius}px`);

    document.body.classList.add("theme-change");
    const cleanup = () => {
      setTimeout(() => document.body.classList.remove("theme-change"), 300);
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => {
        callback();
        cleanup();
      });
    } else {
      callback();
      cleanup();
    }
  };

  const switchTheme = (e: MouseEvent) => {
    const newTheme =
      document.documentElement.getAttribute("saved-theme") === "dark" ? "light" : "dark";

    const doSwitch = () => {
      document.documentElement.setAttribute("saved-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      syncBodyThemeClass(newTheme);
      emitThemeChangeEvent(newTheme);
    };

    themeAnimation(e, doSwitch);
  };

  const themeChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light";
    document.documentElement.setAttribute("saved-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    syncBodyThemeClass(newTheme);
    emitThemeChangeEvent(newTheme);
  };

  const buttons = document.getElementsByClassName("darkmode");
  for (const el of buttons) {
    const darkmodeButton = el as HTMLButtonElement;
    darkmodeButton.addEventListener("click", switchTheme);
    window.addCleanup(() => darkmodeButton.removeEventListener("click", switchTheme));
  }

  // Listen for changes in prefers-color-scheme
  const colorSchemeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  colorSchemeMediaQuery.addEventListener("change", themeChange);
  window.addCleanup(() => colorSchemeMediaQuery.removeEventListener("change", themeChange));
};

document.addEventListener("nav", setupDarkmode);
document.addEventListener("render", setupDarkmode);
