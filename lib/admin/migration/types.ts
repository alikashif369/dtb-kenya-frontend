// Legacy data types for migration

export interface LegacyCalculation {
  Location: string;
  // Year-specific fields (2020-2025)
  [key: string]: string | number | undefined;
}

export interface LegacySpecies {
  Name: string;
  check: string;
  localname: string;
  englishname: string;
  description: string;
  uses: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
}

export interface MigrationResult {
  success: boolean;
  created: number;
  updated: number;
  skipped: number;
  errors: string[];
}

export interface MigrationProgress {
  total: number;
  processed: number;
  current: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}
