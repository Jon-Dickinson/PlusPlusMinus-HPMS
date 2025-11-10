/**
 * Category Seeder
 * 
 * Seeds building categories from JSON data files.
 * Categories define the types of buildings that can be constructed.
 */

import { PrismaClient, BuildingCategory } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CategorySeeder {
  constructor(private prisma: PrismaClient) {}

  /**
   * Load categories data from JSON file
   */
  private loadCategoriesData(): any[] {
    return JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../data/categories.json'), 'utf8')
    );
  }

  /**
   * Seed building categories
   */
  async seedCategories(): Promise<BuildingCategory[]> {
    console.log('Seeding building categories...');
    
    const categoriesData = this.loadCategoriesData();
    const categories: BuildingCategory[] = [];
    
    for (const category of categoriesData) {
      const createdCategory = await this.prisma.buildingCategory.upsert({
        where: { name: category.name },
        update: {
          description: category.description ?? ''
        },
        create: {
          name: category.name,
          description: category.description ?? '',
        },
      });
      
      categories.push(createdCategory);
      console.log(`Created category: ${category.name}`);
    }

    console.log(`Category Summary: Created ${categories.length} categories`);
    return categories;
  }

  /**
   * Get all categories from database
   */
  async getAllCategories(): Promise<BuildingCategory[]> {
    return await this.prisma.buildingCategory.findMany();
  }
}