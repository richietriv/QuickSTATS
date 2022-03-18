import './style.css';
import { Map, View } from 'ol';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import MousePosition from 'ol/control/MousePosition'
import * as olCoordinate from 'ol/coordinate';
import {defaults} from 'ol/interaction';
import { baseMap, streetL, ukbounds, lineLayer, pointLayer } from './layerConnections';
import drawFeatureButton from  './DrawFeatures'
import{draw_on} from  './DrawFeatures'

proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
register(proj4);


const layers = [baseMap, ukbounds, streetL, pointLayer, lineLayer]
let QUERY_LAYERS = ''


let mapView = new View({
  center: [339861.7958798604, 100319.43155530083],
  zoom: 10,
  projection: 'EPSG:27700',
  

});


const map = new Map({
  target: 'map',
  layers: layers,
  view: mapView,
  interactions: defaults({ doubleClickZoom: false }) // disables double click zoom
});
const layerArray = map.getLayers().getArray()
layerArray.forEach((layer) => {
  let layerParams = layer.getSource().params_
  if (layerParams) {
    QUERY_LAYERS += layerParams.LAYERS + ','
  };
}); 

const drawFeatures = new drawFeatureButton({map: map, view: mapView})
map.addControl(drawFeatures)// adds drawing control button
console.log(draw_on)

function layerQuery(featureArray) {

  // when user clicks on the map this function will be run.
  // the features which are captured in the click event
  // are loaded into the featureArray variable.
  // The forEach array method below then iterates
  // through them to build the popup tabs and display
  //the feature information in them

  const getTab = document.getElementById('myTab')
  const getTabContent = document.getElementById('myTabContent')
  getTabContent.innerHTML = ''
  getTab.innerHTML = ''
  console.log(featureArray)
  // the following lines of code build the tabs from the Geojson
  featureArray.forEach((item, index) => {

    let regexMatchTitle = featureArray[index].id.match(/.+?(?=\.\d+$)/);
    
    // activates the tab corresponding to the 0 index
    let activeTabTop
    let activeTabBottom
    let activeTabSelected
    
    if (index == 0) {
      
      activeTabTop = ' active'
      activeTabBottom = ' show active'
      activeTabSelected = true
      
    } else {
      activeTabTop = ''
      activeTabBottom = ''
      activeTabSelected = false
    };
    let newListElem = document.createElement('li')
    newListElem.innerHTML = `<a class="nav-link${activeTabTop}" id="feature${index}-tab" data-toggle="tab" href="#feature${index}" role="tab"aria-controls="feature${index}" aria-selected="${activeTabSelected}">${regexMatchTitle}</a>`
    getTab.append(newListElem)
    
    
    let setDivAttrs = document.createElement('div')
    setDivAttrs.setAttribute('class', `tab-pane fade${activeTabBottom}`)
    setDivAttrs.setAttribute('id', `feature${index}`)
    setDivAttrs.setAttribute('role', 'tabpanel')
    setDivAttrs.setAttribute('aria-labelledby', `feature${index}-tab`)
    getTabContent.append(setDivAttrs)

    const appendElem = document.getElementById(`feature${index}`)

    // build card elements
    let setDivAttrs2 = document.createElement('div')
    setDivAttrs2.setAttribute('class', 'card-body')
    appendElem.append(setDivAttrs2)

    const setH5Attrs = document.createElement('h5')
    setH5Attrs.setAttribute('class', 'card-header')
    setH5Attrs.setAttribute('id', `attr-title${index}`)
    setDivAttrs2.append(setH5Attrs)

    // build the ul elements where the the li tags will be appended
    const setUlAttrs = document.createElement('ul')
    setUlAttrs.setAttribute('class', 'list-group list-group-flush')
    setUlAttrs.setAttribute('id', `attr-list${index}`)
    setDivAttrs2.append(setUlAttrs)


    const attrPopup = document.getElementById(`attr-list${index}`);
    document.getElementById(`attr-list${index}`).innerHTML = '';
    document.getElementById(`attr-title${index}`).innerText = regexMatchTitle;
    let featuresProperties2 = item.properties
    
    for (let key in featuresProperties2) {
      if (featuresProperties2.hasOwnProperty(key) && key != 'OBJECTID') {
        
          // build the li tags to contain the feature attributes         
          let newItem2 = document.createElement('li');
          newItem2.setAttribute('class', 'list-group-item')
          newItem2.innerHTML = `<strong>${key}: </strong>${featuresProperties2[key]}`;
          attrPopup.append(newItem2)
      }
  }

  console.log(getTabContent)
});

};

// get feature info as a Geojson display with modal
map.on('singleclick', (evt) => {
  const viewResolution = mapView.getResolution();
  const url = streetL.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:27700',
    {'INFO_FORMAT': 'application/json', 'QUERY_LAYERS': QUERY_LAYERS.slice(0,-1), 'LAYERS':QUERY_LAYERS.slice(0,-1), 'FEATURE_COUNT': 10},

  );
  
  if (!draw_on) { // while drawing, the popup will not appear
    if (url) {
      fetch(url)
        .then((response) => response.json())
        .then((jsonResp) => {

          if (jsonResp.features.length < 1) {
            
            console.log(jsonResp.features, 'nothing')
          } else { 
            // console.log(jsonResp.features)
            
            layerQuery.bind(this)(jsonResp.features)
            console.log('draw on:', draw_on)
            $('#testmodal').modal('show')
            $('#myTab a').click(function (e) {
              e.preventDefault()
              $(this).tab('show')
            })

          }    
        })
        .catch((err) => {
        throw(err)}); 
    }
  }
});
// // 123test button
// document.getElementById('test-button').addEventListener('click', function() {
//   console.log(document.querySelector('myTabContent'))
  
//   layerQuery.bind(this)(featuresGeoJson)
//   console.log('draw on:', draw_on, selectedGeomType, featureGeom)
  
//   $('#testmodal').modal('show')
//   $('#myTab a').click(function (e) {
//     e.preventDefault()
//     $(this).tab('show')
//   })
// });




// add mouse position to application as easting and northing
const mousePosition = new MousePosition({
  className: 'mousePosition',
  projection: 'EPSG 27700',
  coordinateFormat: coordinate => {
    return olCoordinate.format(coordinate, '{x}, {y}')}
});
map.addControl(mousePosition);


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
