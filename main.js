import Map from 'ol/Map';
import Stamen from 'ol/source/Stamen';
import TileLayer from 'ol/layer/Tile';
import TileGoup from 'ol/layer/Group';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import View from 'ol/View';
import {getCenter} from 'ol/extent';
import {transformExtent} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import osm from 'ol/source/OSM';
import LayerSwitcher from 'ol-layerswitcher';
import ImageLayer from 'ol/layer/Image';

function threeHoursAgo() {
  return new Date(Math.round(Date.now() / 3600000) * 3600000 - 3600000 * 3);
}

const extent = transformExtent([-126, 24, -66, 50], 'EPSG:4326', 'EPSG:3857');
// let startDate = threeHoursAgo();
const frameRate = 0.5; // frames per second
let animationId = null;
var satellite =  new TileLayer({
  title: 'Satellite',
  type: 'base',
  visible: true,
  source: new XYZ({
      attributions: ['Powered by Esri',
          'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
      ],
      attributionsCollapsible: false,
      url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 23
  })
});

var OSM =  new TileLayer({
  title: 'OSM',
  type: 'base',
  visible: true,
  source: new osm()
});

var terrain = new TileLayer({
  title: 'terrain',
  type: 'base',
  visible: true,
  source: new Stamen({
    layer: 'terrain',
  }),
})

var basemaps = new TileGoup({
  title: 'Base Maps',
  layers:[satellite, OSM, terrain]
});



var dates = ['2022-06-10','2022-06-26','2022-07-12','2022-07-28','2022-08-13','2022-08-29','2022-09-14','2022-09-30','2022-10-16','2022-11-01','2022-11-17','2022-12-03','2022-12-19','2022-01-01','2022-01-17','2022-02-02','2022-02-18','2022-03-06','2022-03-22','2022-04-07','2022-04-23','2022-05-09'];
const customLayer = new ImageLayer({
  title: 'Custom',
  visible: true,
  // extent: extent,
  source: new ImageWMS({
    url: 'http://localhost:8080/geoserver/wms',
    params: {'LAYERS': 'IDW:timeseries_data_punjab', 'TIME': '2021-06-10'},
    serverType: 'geoserver'
  }),
});

var overlays = new TileGoup({
  title: 'Overlays',
  layers: [customLayer]
})

const view = new View({
  projection:'EPSG:4326',
  center:[75.86,30.90],
  zoom:8
});

const map = new Map({
  target: 'map',
  view: view
});

map.addLayer(basemaps);
map.addLayer(overlays);

var sliderRange = document.getElementById("myRange");
sliderRange.max = dates.length - 1;

function updateInfo() {
  const el = document.getElementById('info');
  el.innerHTML = new Date(startDate).toISOString();
}
var i = 0;
let startDate = dates[i]

function setTime() {
  // startDate.setMinutes(startDate.getMinutes() + 15);
  if (i >= dates.length - 1) {
    i = 0
  }
  i++
  startDate = dates[i]
  sliderRange.value = i
  customLayer.getSource().updateParams({'TIME': new Date(startDate).toISOString()});
  console.log('setting time : ', new Date(startDate).toISOString())
  updateInfo();
}
setTime();

// Update the current slider value (each time you drag the slider handle)
sliderRange.oninput = function () {
  startDate = dates[this.value].slice(0, 10);
  customLayer.getSource().updateParams({ 'TIME': new Date(startDate).toISOString() });
  i = this.value;
  updateInfo()
}

const stop = function () {
  if (animationId !== null) {
    window.clearInterval(animationId);
    animationId = null;
  }
};

const play = function () {
  stop();
  animationId = window.setInterval(setTime, 100);
};

const startButton = document.getElementById('play');
startButton.addEventListener('click', play, false);

const stopButton = document.getElementById('pause');
stopButton.addEventListener('click', stop, false);

updateInfo();

var layerSwitcher = new LayerSwitcher({
  activationMode: 'click',
  startActive: true,
  tipLabel: 'Layers', // Optional label for button
  groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
  collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);
layerSwitcher.renderPanel()