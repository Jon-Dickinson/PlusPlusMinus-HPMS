/**
 * Hierarchy Seeder
 * 
 * Creates the hierarchical structure of administrative levels:
 * - National (Level 1)
 * - Cities (Level 2) 
 * - Suburbs (Level 3)
 */

import { PrismaClient } from '@prisma/client';
import { SEED_CONFIG } from './config.js';

export class HierarchySeeder {
  constructor(private prisma: PrismaClient) {}

  async seedHierarchy() {
    console.log('Creating hierarchical subtrees (per-national mayor)...');

    // Build a tree for each national mayor. Each root national node will have
    // its own child city nodes and those will have suburb children.
    // We'll create a single admin/root node that represents the system root and
    // will be assigned to the admin user. All national nodes will be children
    // of this root and no city/suburb will be created without a parent.
    const hierarchyData: any = {
      root: null as any,
      nationals: [] as any[]
    };

    // create or find root admin node
    const rootName = 'Admin Root';
    let root = await this.prisma.hierarchyLevel.findFirst({ where: { name: rootName } });
    if (!root) {
      root = await this.prisma.hierarchyLevel.create({ data: { name: rootName, level: 0 } });
    }
    hierarchyData.root = root;

    const nationalCount = SEED_CONFIG.USER_COUNTS.NATIONAL_MAYORS || 1;
    const citiesPerNational = SEED_CONFIG.USER_COUNTS.CITY_MAYORS_PER_CITY || 1;
    const suburbsPerCity = SEED_CONFIG.USER_COUNTS.SUBURB_MAYORS_PER_SUBURB || 1;

    for (let n = 1; n <= nationalCount; n++) {
      const natName = `National ${n}`;

      // ensure unique (find or create)
      // ensure national nodes are children of the system root
      let national = await this.prisma.hierarchyLevel.findFirst({ where: { name: natName, level: SEED_CONFIG.HIERARCHY.NATIONAL.level, parentId: root.id } });
      if (!national) {
        try {
          national = await this.prisma.hierarchyLevel.create({ data: { name: natName, level: SEED_CONFIG.HIERARCHY.NATIONAL.level, parentId: root.id } });
        } catch (err: any) {
          // Handle cases where auto-increment sequence conflicts cause a P2002
          // duplicate id error. Fall back to reading any existing row that
          // approximately matches the name/level.
          if (err?.code === 'P2002') {
            national = await this.prisma.hierarchyLevel.findFirst({ where: { name: natName, level: SEED_CONFIG.HIERARCHY.NATIONAL.level } });
          } else {
            throw err;
          }
        }
      }

      const natObj: any = { ...national, cities: [] };

      // create cities under this national node
      for (let c = 1; c <= citiesPerNational; c++) {
        const cityName = `City ${n}-${c}`; // unique per national
        let city = await this.prisma.hierarchyLevel.findFirst({ where: { name: cityName, level: SEED_CONFIG.HIERARCHY.CITY.level, parentId: natObj.id } });
        if (!city) {
          try {
            city = await this.prisma.hierarchyLevel.create({ data: { name: cityName, level: SEED_CONFIG.HIERARCHY.CITY.level, parentId: natObj.id } });
          } catch (err: any) {
            if (err?.code === 'P2002') {
              city = await this.prisma.hierarchyLevel.findFirst({ where: { name: cityName, level: SEED_CONFIG.HIERARCHY.CITY.level, parentId: natObj.id } });
            } else {
              throw err;
            }
          }
        }

        const cityObj: any = { ...city, suburbs: [] };

        // create suburbs under this city
        for (let s = 1; s <= suburbsPerCity; s++) {
          const suburbName = `Suburb ${n}-${c}-${s}`;
          let suburb = await this.prisma.hierarchyLevel.findFirst({ where: { name: suburbName, level: SEED_CONFIG.HIERARCHY.SUBURB.level, parentId: cityObj.id } });
          if (!suburb) {
            try {
              suburb = await this.prisma.hierarchyLevel.create({ data: { name: suburbName, level: SEED_CONFIG.HIERARCHY.SUBURB.level, parentId: cityObj.id } });
            } catch (err: any) {
              if (err?.code === 'P2002') {
                suburb = await this.prisma.hierarchyLevel.findFirst({ where: { name: suburbName, level: SEED_CONFIG.HIERARCHY.SUBURB.level, parentId: cityObj.id } });
              } else {
                throw err;
              }
            }
          }

          cityObj.suburbs.push(suburb);
          console.log(`Created Suburb level: ${suburb.name} (under ${cityObj.name})`);
        }

        natObj.cities.push(cityObj);
        console.log(`Created City level: ${cityObj.name} (under ${natObj.name})`);
      }

      hierarchyData.nationals.push(natObj);
      console.log(`Created National level: ${natObj.name} with ${natObj.cities.length} cities`);
    }

    const totalCities = hierarchyData.nationals.reduce((acc: number, n: any) => acc + (n.cities?.length || 0), 0);
    const totalSuburbs = hierarchyData.nationals.reduce((acc: number, n: any) => acc + (n.cities?.reduce((s: number, c: any) => s + (c.suburbs?.length || 0), 0) || 0), 0);

    console.log(`Hierarchy Summary: ${hierarchyData.nationals.length} Nationals, ${totalCities} Cities, ${totalSuburbs} Suburbs`);

    return hierarchyData;
  }
}