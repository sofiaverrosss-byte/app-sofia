
import { FoodItem } from './types';

export const INITIAL_FOOD_DB = [
  { name: "Pechuga de Pollo (100g)", cal: 165, p: 31, c: 0, g: 3.6 },
  { name: "Salmón a la plancha (100g)", cal: 208, p: 20, c: 0, g: 13 },
  { name: "Huevos (2 unidades)", cal: 155, p: 13, c: 1, g: 11 },
  { name: "Arroz Blanco (100g)", cal: 130, p: 2.7, c: 28, g: 0.3 },
  { name: "Aguacate (1/2 unidad)", cal: 160, p: 2, c: 8.5, g: 14.7 },
  { name: "Manzana (1 mediano)", cal: 52, p: 0.3, c: 14, g: 0.2 },
  { name: "Batata/Camote (100g)", cal: 86, p: 1.6, c: 20, g: 0.1 }
];

export const DEFAULT_STATE = {
  target: 2000,
  consumed: 0,
  p: 0,
  c: 0,
  g: 0,
  log: [],
  userName: "Elite Athlete",
  profileImg: "https://picsum.photos/200",
  water: 0,
  history: [1850, 2100, 1600, 1950, 2200, 1750, 0]
};
