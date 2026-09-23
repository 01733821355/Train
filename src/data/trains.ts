import { Train } from '../types';
import { WEST_ZONE_TRAINS } from './trainFleetWest';
import { EAST_ZONE_TRAINS } from './trainFleetEast';
import { DHAKA_METRO_TRAINS } from './metroTrains';
export { generateStandardCoaches } from './routeCorridors';

export const BANGLADESH_TRAINS: Train[] = [
  ...DHAKA_METRO_TRAINS,
  ...EAST_ZONE_TRAINS,
  ...WEST_ZONE_TRAINS,
];

export const TRAIN_MAP: Record<string, Train> = Object.fromEntries(
  BANGLADESH_TRAINS.map((t) => [t.id, t])
);
