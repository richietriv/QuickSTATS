import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS';
import Draw from 'ol/interaction/Draw';
import VectorL from 'ol/layer/Vector';
import VectorS from 'ol/source/Vector';
import Overlay from 'ol/Overlay';
import { Control, defaults as defaultControls } from 'ol/control';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import MousePosition from 'ol/control/MousePosition'
import * as olCoordinate from 'ol/coordinate';
import {defaults} from 'ol/interaction';





proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
register(proj4);


const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

const overlay = new Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 1500,
  },
});



 const baseMap =  new TileLayer({
    source: new OSM(),
  });

  const burst = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'test:burst', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
    }),
  });
  
  

  const test = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'test:test', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });

  const streetL = new TileLayer({
    source: new TileWMS({
      url: 'http://localhost:8080/geoserver/wms',
      params: {'LAYERS': 'test:street_lighting', 'TILED': true},
      serverType: 'geoserver',
      transition: 0,
      
    }),
  });


let mapView = new View({
  center: [339861.7958798604, 100319.43155530083],
  zoom: 10,
  projection: 'EPSG:27700',
  
  
  
});


// Global variables
let draw
let draw_on = false
let selectedGeomType


// custom control

class drawFeatureButton extends Control {
  /**
   * @param {Object} [opt_options] Control options.
   */
  constructor(opt_options) {
    const options = opt_options || {};

    const button = document.createElement('button');
    button.innerHTML = '<i class="fa fa-pencil" title="Edit"></i>';

    const element = document.createElement('div');
    element.className = 'draw-app ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    button.addEventListener('click', this.startStopDraw.bind(this), false);
  }
  
  startStopDraw() {
    console.log(draw_on)
     $('#featureSelect').modal('show')
    // if(draw_on == false) {
    //   $('#featureSelect').modal('show')
    // } else {
    //   map.removeInteraction(draw)
    //   console.log(draw)
    //   draw_on = false
    // }
  }

  
}






const map = new Map({
  controls: defaultControls().extend([new drawFeatureButton()]), // adds drawing control button
  target: 'map',
  layers: [baseMap, streetL, test, burst],
  view: mapView,
  overlays: [overlay],
  interactions: defaults({ doubleClickZoom: false }) // disables double click zoom
});



const drawSource = new VectorS()

const drawLayer = new VectorL({
  source: drawSource
})


map.addLayer(drawLayer)


function initiateDraw(geomType) {
  
  console.log(geomType);
  selectedGeomType = geomType
   const draw = new Draw({
    type: geomType,
    source: drawSource
    
  })
 
  // stop drawing
  document.getElementById('stp-drw-btn').addEventListener('click', function() {
    map.removeInteraction(draw);
  });

  $('#featureSelect').modal('hide')
  drawSource.clear()
  map.addInteraction(draw)
  draw_on = true
  console.log(draw_on)

  draw.on('drawstart', function(evt){
    console.log('drawing')
    draw_on = true
  })
  draw.on('drawend', function(evt){
  map.removeInteraction(draw)
  $('#formselectmodal').modal('show')
  draw_on = false
  
})}



// begin drawing line
document.getElementById('linestring-btn').addEventListener('click', function() {
  initiateDraw.bind(this)('LineString');
});

// begin drawing point
document.getElementById('point-btn').addEventListener('click', function() {
  initiateDraw.bind(this)('Point');
});



// test
document.getElementById('test-button').addEventListener('click', function() {
  console.log(selectedGeomType, 'wahoo')
  //saveFeatureButton()
});






function saveFeatureButton() {
  console.log('were here')
    const saveButtons = document.getElementById('commit-search-btn').style.visibility = "hidden";
    
    // console.log(saveButtons)
    // let newButtonElem = document.createElement('button')
    // newButtonElem.innerHTML = 'type="button" class="btn btn-primary" id="save-feat-btn" data-bs-dismiss="modal">save<'

    
    // saveButtons.appendChild(newButtonElem);
  
}


async function SaveDatatodb(x, y) {
  try {
    const result = await fetch('http://localhost:8111/database', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({"col_1": "like fuckin", "geometry": {"type": "Point", "coordinates": [x, y]}})

    })
    console.log(result)
  }
  catch (err) {
    console.log(err)

  } 
    
}


// draw.on('drawend', function(evt){
//   //let clickedCoo = evt.feature.getGeometry().getArea()
//   const coordinate = evt.feature.getGeometry().flatCoordinates;
  
//   map.getView().animate({zoom: 15, center:[540055.3264104014, 141854.6262954283]})
  
  
//   console.log(coordinate)
//   // SaveDatatodb(coordinate[0], coordinate[1])

//   //content.innerHTML =   
//   overlay.setPosition(coordinate);
//  // console.log(clickedCoo)

// })


// add mouse position to application as easting and northing
const mousePosition = new MousePosition({
  className: 'mousePosition',
  projection: 'EPSG 27700',
  coordinateFormat: coordinate => {
    return olCoordinate.format(coordinate, '{x}, {y}')}
});
map.addControl(mousePosition);







// var hello = new button (
  
//     {	html: '<div class="btn-event"></div>',
//       className: "draw-btn",
//       title: "The button",
//       handleClick: () =>
//        {
//         	if(on_off === 0) {
//             // map.addInteraction(draw);
//             let on_off = 1
//             console.log(on_off)
//             return on_off
//         } if(on_off === 1) {
//           map.removeInteraction(draw);
//           console.log('hello!')
//           return on_off
//         }
          
//         }
//     });
// map.addControl(hello);


// // The search control
// var search = new Search(
//   {	//target: $(".options").get(0),
//     // Title to use in the list
//     className: "search-btn",
//     getTitle: function(f) { return f.name; },
//     // Search result
    
    
//   });
// map.addControl (search);

closer.onclick = () => {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

// get feature info as a Geojson
// map.on('singleclick', (evt) => {
//   content.innerHTML = ''
//   overlay.setPosition(evt.coordinate);
//   const viewResolution = mapView.getResolution();
//   const url = streetL.getSource().getFeatureInfoUrl(
//     evt.coordinate,
//     viewResolution,
//     'EPSG:27700',
//     {'INFO_FORMAT': 'application/json'}
//   );
  
//   if (url) {
//     fetch(url)
//       .then((response) => response.json())
//       .then((jsonResp) => {
//         content.innerHTML = `<h3><u>${jsonResp.features[0].id}</u></h3>`
//         let featuresProperties = jsonResp.features[0].properties
//         for (let key in featuresProperties) {
//           if (featuresProperties.hasOwnProperty(key) && key != 'OBJECTID') {
//               // console.log(key + " -> " + featuresProperties[key]);
//               content.innerHTML += `<p><strong>${key}: </strong>${featuresProperties[key]}</p>`
//           }
//       }
//         //document.getElementById('popup').innerHTML = JSON.stringify(featuresProperties);
//         console.log(JSON.stringify(jsonResp.features[0].id))
        
//       })
//       .catch((err) => {
//       throw(err)});
      
//   } else {
//     overlay.setPosition(undefined);
//   }
// });






// map.on('singleclick', (evt) => {
//   content.innerHTML = ''
//   let resolution = mapView.getResolution();
//   const url = streetL.getSource().getFeatureInfoUrl(evt.coordinate, resolution, 'EPSG: 27700', {
//     'INFO_FORMAT' : 'application/json'
  
//   });
//   console.log(viewResolution)


  // if (ur) {
  //   $.getJSON(url, function() {
  //     let feature = data.features[0];
  //     let props = feature.properties;
  //     content.innerHTML = `<h3>RoadName : </h3> <p> ${props} </p>`
  //     console.log(props)

  //   })
  // }
//});


