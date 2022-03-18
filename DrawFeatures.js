import { Control } from 'ol/control';
import Draw from 'ol/interaction/Draw';
import VectorL from 'ol/layer/Vector';
import VectorS from 'ol/source/Vector';
import swal from 'sweetalert';
import GeoJSON from 'ol/format/GeoJSON';

// custom control

// Global variables
let draw
let geomType
export let draw_on = false
const contract = 'SWW'
const searchSizeDiv = document.getElementById('search-size');


function successAlert(title='Search Successful') {
  swal({
    title: `${title}`,
    icon: "success",
    button: "OK",
  });
  
}

function errorAlert(text='Something Went wrong') {
  swal({
    title: 'Error!',
    text: `${text}`,
    icon: "error",
    button: "OK",
  });
  
}

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
   
    async function SaveDatatodb(attrs) {
      let insertFeature = ''
    
      // gets the feature of the draw source and converts to valid geojson
      let formatToGeojson = new GeoJSON()
      let formattedGeojson = formatToGeojson.writeFeaturesObject(drawSource.getFeatures())
      let geojsonGeometry = formattedGeojson.features[0].geometry
      console.log(geojsonGeometry)
    
      if (geomType == 'Point') {
        insertFeature = JSON.stringify({
          "email": attrs.email,
          "reference": attrs.reference,
          "enquiryType": attrs.enquiryType,
          "searchSize": attrs.searchSize,
          "contract": contract,
          "geometry": geojsonGeometry
          });
    
      } else {
        insertFeature = JSON.stringify({
          "email": attrs.email,
          "reference": attrs.reference,
          "enquiryType": attrs.enquiryType,
          "contract": contract,
          "geometry": geojsonGeometry
          });
      };
    
      // reformats the LineString as a MultiLineString
      insertFeature = insertFeature.replace('LineString', 'MultiLineString').replace('[[', '[[[').replace(']]', ']]]')
    
      console.log(insertFeature)
    
      
      try {
        const result = await fetch('http://localhost:8111/database', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json'
          }, 
          body: insertFeature
    
        });
        console.log(result.status)
        if ( result.status == 200) {
          setTimeout(successAlert, 500);
        } else {
          setTimeout(errorAlert, 500);
        };
      }
      catch (err) {
        console.log(err)
        setTimeout(errorAlert);
    
      }
      finally {
        drawSource.clear()

      };
        
    };
    
    let drawSource = new VectorS()
    const drawLayer = new VectorL({
      source: drawSource
    }); 
    
    options.map.addLayer(drawLayer)
    // launch the draw feature selection modal
    button.addEventListener('click', this.launchModal.bind(this, options.map, drawSource), false);

    // begin drawing line
    document.getElementById('linestring-btn').addEventListener('click', event => {
      this.initiateDraw(options.map, drawSource, 'LineString');
    });

    // begin drawing point
    document.getElementById('point-btn').addEventListener('click', event => {
      this.initiateDraw(options.map, drawSource, 'Point');
    });

    // cancel drawing button
    document.getElementById('stp-drw-btn').addEventListener('click', event => {
      options.map.removeInteraction(draw);
      draw_on = false
      
    });
    // validate submit form and submit search event listener
    const saveButton = document.getElementById('form-1')
    saveButton.addEventListener('submit', function(event){
    
      
      event.preventDefault()
      let emailAddress = document.getElementById('email-addr').value
      let reference = document.getElementById('reference').value
      let enquiryType = document.getElementById('select-enquiry-type').value
      let searchSize = ''
      
      if (geomType == 'Point') {
        searchSize = document.getElementById('select-search-size').value

      };
      
      $('#formselectmodal').modal('hide');

      const attrs = {
        "email": emailAddress,
        "reference": reference,
        "enquiryType": enquiryType,
        "searchSize": searchSize,
        "geometryType": geomType
      };

      
      console.log(attrs.reference, attrs.email, 'heeerreee');
      
      let formatToGeojson = new GeoJSON();
      let formattedGeojson = formatToGeojson.writeFeaturesObject(drawSource.getFeatures());
      let geojsonGeometry = formattedGeojson.features[0].geometry;
      console.log(geojsonGeometry);
      
      SaveDatatodb(attrs);
      
    });

  };

  launchModal(map) {
    // function launches the initial modal for selecting the draw feature type
    $('#featureSelect').modal('show');
    map.removeInteraction(draw);
  };
  

  initiateDraw(map, drawSource, geomType) {
    draw = new Draw({
      type: geomType,
      source: drawSource
      
    });
    
    draw.on('drawstart', function(evt){ // executed at the beginning of a draw interaction 
      console.log('hello')
    });
    
    
    draw.on('drawend', function (evt) {
      // executed at the end of a draw interaction 
      let featureGeom = evt.feature.getGeometry();

      map.removeInteraction(draw);
      draw_on = false;

      // evaluates the geometry type. If linestring and over 10k, an error alert will be activated
      if(geomType =='LineString') {
        if(evt.feature.getGeometry().getLength() > 10000) {
          setTimeout(errorAlert, 500, 'Searches cannot exceed 10k');
        } else {
          $('#formselectmodal').modal('show');
        }
        console.log(evt.feature.getGeometry().getLength());
      } else {
        $('#formselectmodal').modal('show');
      }
      // removes draw once a click occurs
      draw_on = false;
    });
    
    
    $('#featureSelect').modal('hide');
    drawSource.clear()
    map.addInteraction(draw);
    draw_on = true;
  
    const formDiv = document.getElementById('form-modal-select');
  
  if (geomType == 'Point') {
    formDiv.append(searchSizeDiv);
  } else {
    searchSizeDiv.remove();

  };
  console.log(geomType, 'type initiated');
  

  
   
  }
  
};


export default drawFeatureButton;