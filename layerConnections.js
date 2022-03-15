import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';



export const baseMap =  new TileLayer({
    source: new OSM(),
  });

  export const burst = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'test:burst', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
    }),
  });
  
  export const test = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'quickstats:test', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });
  
  export const streetL = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'quickstats:street_lighting', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });

  export const ukbounds = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'quickstats:uk boundary', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });

  export const pointLayer = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'quickstats:point_search', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });

  export const lineLayer = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'quickstats:linear_search', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });