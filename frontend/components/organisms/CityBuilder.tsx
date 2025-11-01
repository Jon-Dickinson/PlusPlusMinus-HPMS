// CityBuilder.tsx
import { CityProvider } from './CityContext';
import BuildingSidebar from './BuildingSidebar';
import CityGrid from './CityGrid';

// Layout-only component (no provider) so callers may choose where to provide CityProvider
export function CityBuilderLayout() {
  return (
    <div className="flex w-full h-screen">
      <CityGrid />
    </div>
  );
}

// Default export: legacy wrapper that includes the provider for backward compatibility
export default function CityBuilder() {
  return (
    <CityProvider>
      <div className="flex w-full h-screen">
        <BuildingSidebar />
        <CityBuilderLayout />
      </div>
    </CityProvider>
  );
}
