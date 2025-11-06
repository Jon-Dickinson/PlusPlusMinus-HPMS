export function imageForBuilding(building: any) {
  if (!building) return '';
  if (building.icon) return building.icon;
  if ((building as any).file) {
    const parts = (building as any).file.split('/');
    const basename = parts[parts.length - 1];
    return basename ? `/buildings/${basename}` : (building as any).file;
  }
  const slug = (building.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `/buildings/${slug}.svg`;
}