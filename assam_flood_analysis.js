// ======================================================
// ASSAM FLOOD IMPACT ON AGRICULTURE
// ======================================================


// Assam Boundary
var india = ee.FeatureCollection("FAO/GAUL/2015/level1");
var assam = india.filter(ee.Filter.eq('ADM1_NAME', 'Assam'));

Map.centerObject(assam, 7);


// Sentinel-2 Image
var image = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
  .filterBounds(assam)
  .filterDate('2020-06-01', '2020-10-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .median();


// NDVI for Agriculture
var ndvi = image.normalizedDifference(['B8', 'B4']);


// Agriculture Mask
var agriculture = ndvi.gt(0.35).selfMask();


// ============================
// WATER DATA (STRONG DATASET)
// ============================

var waterDataset = ee.Image("JRC/GSW1_4/GlobalSurfaceWater")
                      .select('occurrence');

var water = waterDataset.gt(30).selfMask();


// ============================
// FLOOD IMPACT
// ============================

var floodImpact = agriculture.and(water).selfMask();


// ============================
// VISUALIZATION
// ============================

// Agriculture — Green
Map.addLayer(
  agriculture.clip(assam),
  {palette: ['00A600']},
  'Agriculture'
);

// Water — Blue
Map.addLayer(
  water.clip(assam),
  {palette: ['0066FF']},
  'Water'
);

// Flood Impact — Red
Map.addLayer(
  floodImpact.clip(assam),
  {palette: ['FF0000']},
  'Flood Impact'
);


// Boundary
Map.addLayer(
  assam.style({
    color: 'black',
    fillColor: '00000000',
    width: 2
  }),
  {},
  'Assam Boundary'
);
// ============================
// EXPORT FLOOD IMPACT MAP
// ============================

Export.image.toDrive({
  image: floodImpact.clip(assam),
  description: 'Assam_Flood_Impact_2020',
  folder: 'EarthEngine',
  fileNamePrefix: 'assam_flood_impact',
  region: assam.geometry(),
  scale: 30,
  maxPixels: 1e13
});
