
export enum PartSelection {
  NEW = 'new',
  USED = 'used',
  REPAIR = 'repair',
}

export interface Part {
  name: string;
  newPrice: number;
  usedPrice: number;
  repairCost: number;
  sourceUrl: string;
  selection: PartSelection;
}

export enum AppScreen {
  WELCOME,
  LOADING,
  RESULTS,
  ERROR,
}
