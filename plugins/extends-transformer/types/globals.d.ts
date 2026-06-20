interface CustomEventMap {
  nav: CustomEvent<{ url: string }>;
  themechange: CustomEvent<{ theme: "light" | "dark" }>;
  render: CustomEvent<object>;
}

declare const fetchData: Promise<Record<string, unknown>>;
