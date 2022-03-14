import './style.css';
import { Map, View } from 'ol';
import Draw from 'ol/interaction/Draw';
import VectorL from 'ol/layer/Vector';
import VectorS from 'ol/source/Vector';
import { Control, defaults as defaultControls } from 'ol/control';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import MousePosition from 'ol/control/MousePosition'
import * as olCoordinate from 'ol/coordinate';
import {defaults} from 'ol/interaction';
import swal from 'sweetalert';
import { baseMap, burst, test, streetL, ukbounds } from './layerConnections';



proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs'
);
register(proj4);


let mapView = new View({
  center: [339861.7958798604, 100319.43155530083],
  zoom: 10,
  projection: 'EPSG:27700',
  

});


// Global variables
let featureGeom
let draw_on = false
let selectedGeomType
let featuresGeoJson


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
     $('#featureSelect').modal('show');
  }
};


const map = new Map({
  controls: defaultControls().extend([new drawFeatureButton()]), // adds drawing control button
  target: 'map',
  layers: [baseMap, ukbounds, streetL, test, burst],
  view: mapView,
  //overlays: [overlay],
  interactions: defaults({ doubleClickZoom: false }) // disables double click zoom
});



const drawSource = new VectorS()

const drawLayer = new VectorL({
  source: drawSource
})


map.addLayer(drawLayer)


function initiateDraw(geomType) {
  
  console.log(geomType, 'type initiated');
  selectedGeomType = geomType
   const draw = new Draw({
    type: geomType,
    source: drawSource
    
  })
 
  // stop drawing
  document.getElementById('stp-drw-btn').addEventListener('click', function() {
    map.removeInteraction(draw);
    draw_on = false
  });

  $('#featureSelect').modal('hide')
  drawSource.clear()
  map.addInteraction(draw)
  draw_on = true

  draw.on('drawstart', function(evt){
    console.log('drawing')
    draw_on = true
  })
  draw.on('drawend', function(evt){
    featureGeom = evt.feature.getGeometry().flatCoordinates;
    map.removeInteraction(draw)

    // evaluates the geometry type. If linestring and over 10k, an error alert will be activated
  if(geomType =='LineString') {
    if(evt.feature.getGeometry().getLength() > 10000) {
      setTimeout(errorAlert, 500);
      
      
    } else {
      $('#formselectmodal').modal('show')
    }
    console.log(evt.feature.getGeometry().getLength())
  } else {
    $('#formselectmodal').modal('show')
  }
  draw_on = false
})};



// begin drawing line
document.getElementById('linestring-btn').addEventListener('click', function() {
  initiateDraw.bind(this)('LineString');
});

// begin drawing point
document.getElementById('point-btn').addEventListener('click', function() {
  initiateDraw.bind(this)('Point');
});
// 
function geoQuery(fGeoJson) {
  const getTab = document.getElementById('myTab')
  const getTabContent = document.getElementById('myTabContent')
  getTabContent.innerHTML = ''
  getTab.innerHTML = ''

  // the following lines of code build the tabs from the Geojson
  fGeoJson.forEach((item, index) => {
    

    let regexMatchTitle = fGeoJson[0].id.match(/.+?(?=\.\d+$)/);

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

}
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
  var currId = $(e.target).attr("id");
  
  //just for demo
  $('#lastTab').html(currId);
  console.log(currId)
})

// 123test button
document.getElementById('test-button').addEventListener('click', function() {
  console.log(document.querySelector('myTabContent'))
  
  geoQuery.bind(this)(featuresGeoJson)
  console.log('draw on:', draw_on, selectedGeomType, featureGeom)
  $('#testmodal').modal('show')
  $('#myTab a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
});



function successAlert() {
  swal({
    title: "Search Successful!",
    icon: "success",
    button: "OK",
  });
  
}

function errorAlert() {
  swal({
    title: "Error!",
    text: 'Searches cannot exceed 10k',
    icon: "error",
    button: "OK",
  });
  
}

// validate submit form and submit search event listener
const saveButton = document.getElementById('form-1')
saveButton.addEventListener('submit', function(event){
  event.preventDefault()
  let emailAddress = document.getElementById('email-addr').value
  let reference = document.getElementById('reference').value
  $('#formselectmodal').modal('hide')

  setTimeout(successAlert, 500);
  console.log(emailAddress, reference, featureGeom)
  SaveDatatodb(featureGeom)
  
})
    



async function SaveDatatodb(geometryArray) {
  try {
    const result = await fetch('http://localhost:8111/database', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({"col_1": "This is working!", "geometry": {"type": "Point", "coordinates": geometryArray}})

    });
    console.log(result)
  }
  catch (err) {
    console.log(err)

  } 
    
};


// add mouse position to application as easting and northing
const mousePosition = new MousePosition({
  className: 'mousePosition',
  projection: 'EPSG 27700',
  coordinateFormat: coordinate => {
    return olCoordinate.format(coordinate, '{x}, {y}')}
});
map.addControl(mousePosition);



// get feature info as a Geojson display with modal
map.on('singleclick', (evt) => {
  const viewResolution = mapView.getResolution();
  const url = streetL.getSource().getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:27700',
    {'INFO_FORMAT': 'application/json', 'QUERY_LAYERS': 'quickstats:street_lighting,quickstats:test', 'LAYERS':'quickstats:street_lighting,quickstats:test', 'FEATURE_COUNT': 10},

  );
 
  if (!draw_on) { // while drawing, the popup will not appear
    if (url) {
      fetch(url)
        .then((response) => response.json())
        .then((jsonResp) => {

          if (jsonResp.features.length < 1) {
            
            console.log(jsonResp.features, 'nothing')
          } else { 
            geoQuery.bind(this)(jsonResp.features)
            console.log('draw on:', draw_on, selectedGeomType, featureGeom)
            $('#testmodal').modal('show')
            $('#myTab a').click(function (e) {
              e.preventDefault()
              $(this).tab('show')
            })


          // let regexMatchTitle = jsonResp.features[0].id.match(/.+?(?=\.\d+$)/);

          // const attrPopup = document.getElementById('attr-list');
          // document.getElementById('attr-list').innerHTML = '';
          // document.getElementById('attr-title').innerText = regexMatchTitle[0];
        
          //$('#feature-popup').modal('show');
          
          
          
          // featuresGeoJson = jsonResp.features
          // let featuresProperties = jsonResp.features[0].properties
          // for (let key in featuresProperties) {
          //   if (featuresProperties.hasOwnProperty(key) && key != 'OBJECTID') {
                
                            
          //       let newItem = document.createElement('li');
          //       newItem.setAttribute('class', 'list-group-item')
          //       newItem.innerHTML = `<strong>${key}: </strong>${featuresProperties[key]}`;
          //       attrPopup.append(newItem)
          //   }
        //}     
          // console.log(JSON.stringify(jsonResp.features[0].id))
          }    
        })
        .catch((err) => {
        throw(err)}); 
    }
  }
});


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
