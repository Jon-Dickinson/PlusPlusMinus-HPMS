# Database Seeders

This directory contains modular, human-readable database seeders for the PlusPlusMinus HPMS system.

## Structure

### Core Files

- **`config.ts`** - Central configuration for all seeding operations
- **`index.ts`** - Export point for all seeder classes

### Seeder Classes

- **`hierarchy.seeder.ts`** - Creates the hierarchical administrative structure
- **`user.seeder.ts`** - Creates user accounts with appropriate roles and hierarchy assignments  
- **`city.seeder.ts`** - Creates cities for all mayors based on their hierarchy level
- **`building.seeder.ts`** - Seeds building categories, buildings, and assigns permissions
- **`summary.reporter.ts`** - Generates comprehensive reports and summaries

## Execution Order

The seeders must be executed in this specific order due to foreign key dependencies:

1. **Hierarchy Levels** - Creates the administrative structure
2. **Users** - Creates accounts and assigns them to hierarchy levels
3. **Cities** - Creates cities for mayors
4. **Buildings** - Seeds building data and categories
5. **Permissions** - Assigns building permissions based on hierarchy level
6. **Summary** - Generates reports

## Configuration

All seeding behavior is controlled through `config.ts`:

- User counts at each level
- Default passwords
- Hierarchy structure
- Building permission rules
- City generation settings

## User Account Summary

The system creates 20 total users:

- **1 Admin** (National level, full access)
- **2 National Mayors** (All building permissions)  
- **4 City Mayors** (Limited building permissions)
- **8 Suburb Mayors** (Most restricted permissions)
- **5 Viewers** (Read-only access)

## Building Permissions

- **National Level**: All building types
- **City Level**: Commercial, Emergency, Energy, Utilities, Residential, Agriculture
- **Suburb Level**: Residential, Agriculture only
- **Viewers**: No building permissions

## Testing

All accounts use the password: `Password123!`

Key test accounts:
- `admin@example.com` - Full system access
- `national1@example.com` - National mayor with all buildings
- `citya1@example.com` - City mayor with limited buildings  
- `suburb_a11@example.com` - Suburb mayor with minimal buildings
- `viewer1@example.com` - Read-only access

## Usage

The main seed file (`../seed.ts`) orchestrates all seeders automatically. Simply run:

```bash
npx prisma db seed
```

## Human Readability

Each seeder class:
- Has clear, descriptive method names
- Includes comprehensive documentation
- Provides detailed console logging
- Separates concerns into logical methods
- Uses meaningful variable names
- Avoids complex nested logic

This modular approach makes the seeding process much easier to understand, maintain, and extend.