import { createContext, useContext } from "react";

type SectionKey = "vault" | "archive";

type TabVisibilityContextValue = {
  isVisible: (section: SectionKey) => boolean;
};

const TabVisibilityContext = createContext<TabVisibilityContextValue | null>(null);

export function TabVisibilityProvider({
  value,
  children,
}: {
  value: TabVisibilityContextValue;
  children: React.ReactNode;
}) {
  return <TabVisibilityContext.Provider value={value}>{children}</TabVisibilityContext.Provider>;
}

export function useTabVisibility(section: SectionKey) {
  const context = useContext(TabVisibilityContext);
  if (!context) {
    return true;
  }

  return context.isVisible(section);
}
