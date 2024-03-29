// TODO: fix type errors

import * as React from 'react'
import * as types from 'lib/types'
import * as L from "leaflet"
import omnivore from "@mapbox/leaflet-omnivore"
/// <script type="module" src="/tools/components/map-tool.js"></script>
// import * as MapTool from "./old_components/tools/components/map-tool.js"
// import _ from "lodash"
/// <link rel="stylesheet" href="/tools/components/map-tool.css"/>
// import styles from "./map-tool.css"
import { hideError, logError } from "./Tool"
import { I } from "./state-helpers"

// raw global state. todo: convert to props/useState
let attribution,
    tileLayerUrl,
    tileLayer,
    coord,
    zoom,
    mapData,
    mapType,
    mapDataLayers = [],
    map;

export const MapTool: React.FC<types.PageProps> = ({ site, pageId, error }) => {
    React.useEffect(setupMaps);
// </script>
    const title = site?.name
    // const mapTool = site?.tool // TODO(korede)

    const handlers = {
        mouseUpSelect: (e) => { e.target.select() },
        mouseDownAttribSetPlaceholder: (e) => { if (!e.target.value) attribution.set(e.target.placeholder) },
        mouseDownZoomSetPlaceholder: (e) => { if (!e.target.value) zoom.set(e.target.placeholder) },
        changeAttribSetValue: (e) => { attribution.set(e.target.value) },
        changeCoord0SetValue: (e) => { coord[0].set(e.target.value) },
        changeCoord1SetValue: (e) => { coord[1].set(e.target.value) },
        changeZoomSetValue: (e) => { zoom.set(e.target.value) },
        change: (e) => {mapType.set(e.target.value)},
        changeMapTypeSetValue: (e) => { mapType.set(e.target.value) }
    }
    return (
        <>
            <div className="MAP tool-container flex flex-row">
                <div id="map" className="MAP"></div>
            </div>

            <div id="map-settings" className="map-settings flex flex-column pa3 ma1 pt0 f7">
                <div className="f7 o-40 fw5 bb pa1 pt2" style={{width: "fit-content"}}>
                    <span style={{width: "fit-content"}}>SETTINGS</span>
                </div>
                <br/>

                <div className="map-setting flex flex-row h1 ma1">
                    <label title="tile-layer-setting" className="fw5 w-30 dib">TILE LAYER:</label> 
                    <input 
                        id="tile-layer-setting"
                        name="tile-layer"
                        placeholder= "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="setting bg-transparent w-70 pa0 dib"
                        type="text"
                        onChange={(event) => { tileLayerUrl.set(event.target.value); } }
                        // onMouseDown={(event) => { if (!<HTMLInputElement>(event.target)["value"]) tileLayerUrl.set(event.target["placeholder"]); } }
                        onMouseUp={(event) => { (event.target as HTMLInputElement).select() } }
                    />
                    <br/>
                </div>
                <div className="map-settings-subgroup ml2">
                    <div className="map-setting flex flex-row h1 ma1">
                        <label htmlFor="attribution-setting" className="fw5 w-30 dib">ATTRIBUTION:</label> 
                        <input 
                            id="attribution-setting"
                            name="attribution"
                            placeholder={"&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"}
                            onMouseDown={handlers.mouseDownAttribSetPlaceholder}
                            onMouseUp={handlers.mouseUpSelect}
                            onChange={handlers.changeAttribSetValue}
                            className="setting bg-transparent w-70 pa0 dib"/>
                    </div>
                </div>
                <div className="map-setting-group flex flex-row flex-nowrap">
                    <div className="map-setting flex flex-row h1 ma1 mr4 w-60 dib">
                        <label htmlFor="coord-setting" className="fw5 w-50 dib">COORDS:</label> 
                        <input 
                            id="coord-lon-setting" 
                            name="coord-lon"
                            placeholder="LON"
                            value="6.498820462853738"
                            onMouseUp={handlers.mouseUpSelect}
                            onChange={handlers.changeCoord0SetValue}
                            className="setting bg-transparent w-20 pa0 mr1 db"/>
                        <span className="pt3">,</span>
                        <input 
                            id="coord-lat-setting" 
                            name="coord-lat"
                            placeholder="LAT"
                            value="3.3958632487106137"
                            onMouseUp={handlers.mouseUpSelect}
                            onChange={handlers.changeCoord0SetValue}
                            className="setting bg-transparent w-20 ml2 pa0 db"/>
                        <br/>
                    </div>
                    <div className="map-setting flex flex-row h1 ma1 w-40 dib">
                        <label htmlFor="zoom-setting" className="fw5 w-50 dib">ZOOM:</label> 
                        <input 
                            id="zoom-setting" 
                            name="zoom"
                            placeholder="5"
                            onMouseDown={handlers.mouseDownZoomSetPlaceholder}
                            onMouseUp={handlers.mouseUpSelect}
                            onChange={handlers.changeZoomSetValue}
                            className="setting bg-transparent w-20 pa0 mr1 db"/>
                    </div>
                </div>
                <div className="map-setting flex flex-row h1 ma1">
                    <label htmlFor="map-type-setting" className="fw5 w-30 dib">MAP TYPE:</label> 
                    <select
                        id="map-type-setting"
                        name="map-type"
                        className="setting bg-transparent w-70 pa0 dib"
                        onChange={handlers.changeMapTypeSetValue}>

                        <option value="normal">
                        Normal
                        </option>

                        <option value="timeseries">
                        Time Series  
                        </option>

                    </select>
                </div>

                <div className="map-setting flex flex-row h1 ma1">
                    <label htmlFor="import-data-setting" className="fw5 w-30 dib">IMPORT DATA:</label> 
                    <input 
                        id="import-data-setting"
                        name="import-data"
                        placeholder= "comma separated list of KML or GeoJSON files"
                        onMouseUp={handlers.mouseUpSelect}
                        type="text"
                        className="setting bg-transparent w-70 pa0 dib"
                        onChange={(event) => mapData.set(event.target.value)}
                  />
                    <datalist id="map-datasets">
                        {/*site?.data?.maps.map((map) => (
                            <option value={ map.url }>{ map.name }</option>
                        ))*/}
                    </datalist>
                </div>

                <div id="settings-error" className="red f7 o-40 fw5 pa1 pt2 flex flex-row" style={{ width: "fit-content"}}>
                    <span className="b" style={{ width: "fit-content"}}>ERROR: </span> 
                    <br/>
                    <div id="settings-error-msg"> 
                    </div> 
                    <br/>
                    <a className="black pointer" onClick={_ => hideError()}><small>CLEAR</small></a>
                </div>

                <p className="f7 gray pa2">
                    <a href="https://en.wikipedia.org/wiki/Kml">KML</a> files can be created on Google Earth 
                    and <a href="https://en.wikipedia.org/wiki/GeoJSON">GeoJSON</a> files can be created 
                    on tools like <a href="https://geojson.io">geojson.io</a>
                </p>
            </div>

        </>
    )
}

export const setupMaps = () => {
    hideError();

    // DEFAULT VALUES
    attribution = new I('attribution-setting');
    tileLayerUrl = new I('tile-layer-setting');
    zoom = new I('zoom-setting', 5);
    coord = [new I('coord-lon-setting', 6.498820462853738), new I('coord-lat-setting', 3.3958632487106137)];
    mapData = new I('import-data-setting');
    mapType = new I('map-type-setting');
    
    let allSettings =  {
        attribution, tileLayerUrl, zoom, coord, mapData,
    };

    map = L.map('map').setView([coord[0].get(), coord[1].get()], 9);
    map.on('moveend', function(e) {
        zoom.set(map.getZoom(), false);
        let center = map.getCenter();
        coord[0].set(center.lat, false);
        coord[1].set(center.lng, false);
    });
    map.setZoom(zoom.get())

    tileLayer = L.tileLayer(tileLayerUrl.get(), {
        // zoom: zoom.get(),
        maxZoom: 19,
        subdomains: ['mt0','mt1','mt2','mt3'],
        attribution: attribution.get()
    }).addTo(map);
    
    zoom.update     = function(val) { map.setView([coord[0].get(), coord[1].get()], val); }
    coord[0].update = function(val) { map.setView([val,            coord[1].get()], zoom.get()); }
    coord[1].update = function(val) { map.setView([coord[0].get(), val],            zoom.get()); }
    tileLayerUrl.update = function(val) { 
        // TODO: make this multi-select and track multiple layers
        map.removeLayer(tileLayer);
        tileLayer = L.tileLayer(val);
        map.addLayer(tileLayer);
    }
    attribution.update = function(val) { 
        map.attributionControl.removeAttribution(val);
        map.attributionControl.addAttribution(val);
    }
    mapData.update = function (val) {
        let datasets = val.split(',');
        for (var i = 0; i < mapDataLayers.length; i++) {
            map.removeLayer(mapDataLayers[i]);
        }
        mapDataLayers = [];
        let MAP_TYPE = mapType.get();
        console.log("MAP_TYPE", MAP_TYPE);

        if (MAP_TYPE === "regular") {
            for (var i = 0; i < datasets.length; i++) {
                let ext = datasets[i].split('.').pop();
                if(!!omnivore[ext]) {
                    let layer = omnivore[ext](datasets[i]);
                    mapDataLayers.push(layer);
                    layer.addTo(map);
                    hideError();
                } else {
                    logError(`bad data url: ${datasets[i]}`);
                }
            }
        } else if (MAP_TYPE === "timeseries") {
            // courtesy: https://cartographicperspectives.org/index.php/journal/article/view/cp76-donohue-et-al/1307
            function processData(data) {
            var timestamps = [];
            var min = Infinity;
            var max = -Infinity;
            var selectorLabels = [];

            for (var feature in data.features) {
                var properties = data.features[feature].properties;
                // timestamps = properties.map()
                for (var attribute in properties) {
                if (attribute != 'id' &&
                    attribute != 'name' &&
                    attribute != 'ItemLabels' &&
                    attribute != 'lat' &&
                    attribute != 'lon') {
                    // console.log("adding prop: ", attribute, properties[attribute]);
                    if (!timestamps.includes(attribute)) {
                    timestamps.push(attribute);
                    }
                    if (properties[attribute] < min) {
                    min = properties[attribute];
                    }
                    if (properties[attribute] > max) {
                    max = properties[attribute];
                    }
                } else if (attribute === "ItemLabels" && !selectorLabels.includes(properties[attribute])) {
                    selectorLabels.push(properties[attribute]);
                }
                }
            }

            return {
                timestamps, min, max, selectorLabels
            }
            }

            function getColor(d) {
            return d > 1000 ? '#800026' :
                    d > 500  ? '#BD0026' :
                    d > 200  ? '#E31A1C' :
                    d > 100  ? '#FC4E2A' :
                    d > 50   ? '#FD8D3C' :
                    d > 20   ? '#FEB24C' :
                    d > 10   ? '#FED976' :
                                '#FFEDA0';
            }

            function calcPropRadius(attributeValue) {
            var scaleFactor = 0.3;
            var area = attributeValue * scaleFactor;
            return Math.sqrt(area/Math.PI)*2;			
            }

            function createPropSymbols(timestamps, data, selectorLabels) {
            console.log("TIMESTAMPS", timestamps);
            // let layer = omnivore.geojson(datasets[0]);
            let layer = L.geoJson(data, {
                pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, { 
                    fillColor: "#708598",
                    color: "#537898",
                    weight: 1, 
                    fillOpacity: 0.6 
                }).on({
                    mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({color: "yellow"});
                    },
                    mouseout: function(e) {
                    this.closePopup();
                    this.setStyle({color: "#537898"});
                    }
                });
                },
            });
            mapDataLayers.push(layer);
            layer.addTo(map);
            hideError();
            updatePropSymbols(timestamps[0], selectorLabels[0]);
            }

            function updatePropSymbols(timestamp, selectorLabel) {
            mapDataLayers[0].eachLayer(function(layer) {
                // map.removeLayer(layer);
                var props = layer.feature.properties;
                if (!isNumeric(props[timestamp])) { return; }
                if (props["ItemLabels"] !== selectorLabel) {
                map.removeLayer(layer);
                return;
                }
                console.log("layer feature props", timestamp, props[timestamp], selectorLabel);
                var radius = calcPropRadius(props[timestamp]);
                var color = getColor(props[timestamp]);
                var popupContent = "<b> ₦" + String(props[timestamp]) + 
                    " </b><br>" +
                    "<i>" + selectorLabel +
                    "</i> in </i>" +
                    formatDate(timestamp, false) + "</i>";
                console.log("r: ", radius);
                layer.setRadius(radius);
                // layer.setColor(color);
                layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
            });
            }

            /*
            var geojsonTimeseriesLayer = L.geojson(null, {
            filter: function(feature) {
                var properties = feature.properties; 
                // timestamps = properties.map()
                for (var attribute in properties) {
                console.log("adding prop: ", attribute, properties[attribute]);
                if (attribute != 'id' &&
                    attribute != 'name' &&
                    attribute != 'ItemLabels' &&
                    attribute != 'lat' &&
                    attribute != 'lon') {
                    if (!timestamps.includes(attribute)) {
                    timestamps.push(attribute);		
                    }
                    if (properties[attribute] < min) {	
                    min = properties[attribute];
                    }
                    if (properties[attribute] > max) { 
                    max = properties[attribute]; 
                    }
                    return true;
                }
                return false;
                }
            },
            pointToLayer: function(feature, latlng) {
                return L.circleMarker(latlng, { 
                fillColor: "#708598",
                color: "#537898",
                weight: 1, 
                fillOpacity: 0.6 
                }).on({
                mouseover: function(e) {
                    this.openPopup();
                    this.setStyle({color: "yellow"});
                },
                mouseout: function(e) {
                    this.closePopup();
                    this.setStyle({color: "#537898"});
                }
                });
            },
            onEachFeature: function(feature, layer) {
                var props = layer.feature.properties;
                var radius = calcPropRadius(props[timestamp]);
                var popupContent = "<b>" + String(props[timestamp]) + 
                    " units</b><br>" +
                    "<i>" + props.name +
                    "</i> in </i>" + 
                    timestamp + "</i>";
            
                layer.setRadius(radius);
                layer.bindPopup(popupContent, { offset: new L.Point(0,-radius) });
            }
            });
            */

            function createSliderUI(timestamps) {
            var sliderControl = L.control({ position: 'bottomleft'} );

            sliderControl.onAdd = function(map) {
                var slider = L.DomUtil.create("input", "range-slider");
                L.DomEvent.addListener(slider, 'mousedown', function(e) {
                L.DomEvent.stopPropagation(e);
                });

                slider.setAttribute("type", "range");
                slider.setAttribute("max", (new Date(timestamps[timestamps.length-1])).getTime());
                slider.setAttribute("min", (new Date(timestamps[0])).getTime());
                let date2 = new Date(timestamps[1]); let date1 = new Date(timestamps[0]); let oneDayDiff = date2.getTime() - date1.getTime();
                slider.setAttribute("step", oneDayDiff);
                slider.setAttribute("value", (new Date(String(timestamps[0]))).getTime());
                var handler = function(e) {
                let selectorLabel = document.querySelector(".selector-label-input").value;
                let selectedDate = formatDate(new Date(parseInt(e.target.value)), false);
                updatePropSymbols(selectedDate, selectorLabel);
                document.querySelector(".temporal-legend").innerText = selectedDate;
                }
                slider.addEventListener("input", handler);
                slider.addEventListener("change", handler);
                return slider;
            }

            sliderControl.addTo(map);
            createTemporalLegend(timestamps[0]); 
            }

            function createTemporalLegend(startTimestamp) {
            var temporalLegend = L.control({ position: 'bottomleft' }); 

            temporalLegend.onAdd = function(map) { 
                var output = L.DomUtil.create("output", "temporal-legend");
                output.innerText = formatDate(new Date(startTimestamp), false);
                return output; 
            }

            temporalLegend.addTo(map); 
            }
            
            function createSelectorUI(selectorLabels) {
            var selectorControl = L.control({ position: 'bottomright'} );

            selectorControl.onAdd = function(map) {
                var selector = L.DomUtil.create("select", "selector-label-input");
                L.DomEvent.addListener(selector, 'mousedown', function(e) {
                L.DomEvent.stopPropagation(e);
                });

                console.log("selectorLabels", selectorLabels);
                for (var i = 0; i < selectorLabels.length; i++) {
                selector.innerHTML += `<option value="${selectorLabels[i]}">${selectorLabels[i]}</option>`
                }
                var handler = function(e) {
                let rangeSliderValue = document.querySelector(".range-slider").value;
                let selectedDate = formatDate(new Date(parseInt(rangeSliderValue)), false);
                updatePropSymbols(selectedDate, e.target.value);
                // updatePropSymbols(e.target.value.toString());
                }
                selector.addEventListener("input", handler);
                selector.addEventListener("change", handler);
                return selector;
            }

            selectorControl.addTo(map);
            }

            // let layer = omnivore.geojson(datasets[0] /* only handling the first GeoJSON dataset here */);

            // layer.on('ready', function() {
            //   console.log("timeseries layer: ", layer);
            //   var { timestamps, min, max} = processData(layer);
            //   createPropSymbols(timestamps, layer);
            //   createLegend(min, max);
            //   createSliderUI(timestamps);
            // });

            fetch(datasets[0])
            .then(response => response.json())
            .then(data => {
                console.log(data);
                var {timestamps, selectorLabels, min, max} = processData(data);
                // sort timestamps
                timestamps = timestamps.map((t) => (new Date(t)).getTime()).sort().map((d) => formatDate(new Date(d), false))
                createPropSymbols(
                timestamps,
                data,
                selectorLabels.sort()
                );
                // createLegend(min, max);
                createSelectorUI(selectorLabels);
                createSliderUI(timestamps);
            });

            // mapDataLayers.push(layer);
            // layer.addTo(map);

            hideError();
        }
    }
}

// <script map-script>
function formatDate(date, noDate = true) {
    if (date !== undefined && date !== "") {
    var myDate = new Date(date);
    var month = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ][myDate.getMonth()];
    var str = (noDate ? (myDate.getDate() + " ") : "") + month + " " + myDate.getFullYear();
    return str;
    }
    return "";
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
