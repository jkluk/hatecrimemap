import ghFilters from '../globals/ghFilters';
import { arrToObject } from './utilities';

const filteringOptions = arrToObject(ghFilters);
filteringOptions.verified = {
  color: 'red',
  customFilter: ({ verified }) => Number(verified) > 0,
};
export const allpoints = [];

export function addGroupsHarassedSplit(mapdata) {
  const mapdataWithGroupsSplit = mapdata.map((point) => {
    const groupharassedsplit = point.groupharassedcleaned.split(',');
    return Object.assign({ groupharassedsplit }, point);
  });
  return mapdataWithGroupsSplit;
}

export function storeMapData(mapdata) {
  const mapadataWithGroupsSplit = addGroupsHarassedSplit(mapdata);
  mapadataWithGroupsSplit.forEach(point => allpoints.push(point));
}

export function updateCurrentLayers(layerName, prevLayers) {
  const currentLayers = new Set(prevLayers);

  if (currentLayers.has(layerName)) {
    currentLayers.delete(layerName);
  } else {
    currentLayers.add(layerName);
  }
  return currentLayers;
}

function addColor(mapdata, currentLayers) {
  let mapdataWithColor;
  // const { size } = currentLayers;
  // const sizeWithoutVerified = (currentLayers.has('verified')) ? size - 1 : size;
  if (currentLayers.size >= 2) {
    mapdataWithColor = mapdata.map(point => Object.assign({ color: '#000000' }, point));
  } else {
    const currentLayer = currentLayers.values().next().value;
    const { color } = filteringOptions[currentLayer];
    mapdataWithColor = mapdata.map(point => Object.assign({ color }, point));
  }
  return mapdataWithColor;
}

export function getMapData(layerName, prevLayers) {
  const currentLayers = new Set(prevLayers);
  if (currentLayers.size === 0) {
    return allpoints;
  }
  let mapdata = allpoints.slice();
  currentLayers.forEach((layer) => {
    const { customFilter } = filteringOptions[layer];
    const filteredData = mapdata.filter(point => customFilter(point));
    mapdata = filteredData;
  });
  const mapdataWithColor = addColor(mapdata, currentLayers);
  return mapdataWithColor;
}

