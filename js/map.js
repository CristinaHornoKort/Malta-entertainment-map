// load dgrid, esri and dojo modules
// create the grid and the map
// then parse the dijit layout dijits
require([
    "dojo/ready",
    "esri/geometry/Extent",
    "esri/config",
    "esri/tasks/GeometryService",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/dijit/Popup",
    "esri/dijit/PopupTemplate",
    "dojo/dom-construct",
    "esri/Color",
    "esri/dijit/BasemapToggle",
    "esri/dijit/LayerList",
    //"application/LayerList",

    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dojo/store/Memory",
    "dojo/_base/array",
    "dojo/dom-style",
    "dijit/registry",
    "esri/map",
    "esri/layers/FeatureLayer",
    "esri/symbols/SimpleFillSymbol",
    "esri/tasks/QueryTask",
    "esri/tasks/query",
    "dojo/_base/declare",
    "dojo/number",
    "dojo/on",
    "dojo/parser",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(
    ready,
    Extent,
    esriConfig,
    GeometryService,
    SimpleMarkerSymbol,
    Popup, PopupTemplate,
    domConstruct,
    Color,
    BasemapToggle,
    LayerList,


    Grid,
    Selection,
    Memory,
    array,
    domStyle,
    registry,
    Map,
    FeatureLayer,
    SimpleFillSymbol,
    QueryTask,
    Query,
    declare,
    dojoNum,
    on,
    parser
) {
    ready(function() {

            parser.parse();


            var popupTemplate = new PopupTemplate({
                title: "Name: {NAME}",
                fieldInfos: [{
                    fieldName:  "TYPE",
                    label:  "Type:  ",
                    visible: true
                }, {
                    fieldName:  "category",
                    label:  "category:  ",
                    visible: true
                }, {
                    fieldName:  "ADDRESS",
                    label:  "Address:  ",
                    visible: true
                }, {
                    fieldName:  "locality",
                    label:  "locality:  ",
                    visible: true
                }, {
                    fieldName:  "postcode",
                    label:  "postcode:  ",
                    visible: true
                }, {
                    fieldName:  "PHONE",
                    label:  "phone:  ",
                    visible: true
                }, {
                    fieldName:  "EMAIL",
                    label:  "email:  ",
                    visible: true
                }, {
                    fieldName:  "URL",
                    label:  "Website:  ",
                    visible: true
                }],
                //description: "address: {address} ",
                showAttachments: false
            });

            // create the dgrid
            window.grid = new (declare([Grid, Selection]))({
                // use Infinity so that all data is available in the grid
                bufferRows: Infinity,
                columns: {
                    "id": "ID",
                    "name": "Name",
                    "address": { "label": "Address" },
                    "phone": { "label": "Phone"},
                    "postcode": { "label": "postcode"},
                    "url": { "label": "url"},
                    "email": { "label": "email"},
                    "locality": { "label": "locality"},
                    "category": { "label": "category"}
                }
            }, "grid");
            // add a click listener on the ID column
            grid.on(".field-id:click", selectState);

            esriConfig.defaults.geometryService = new GeometryService("http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer");

            var popupOptions = {
                markerSymbol: new SimpleMarkerSymbol("circle", 32, null,
                    new Color([0, 0, 0, 0.35])),
                marginLeft: "20",
                marginTop: "20"
            };
            //create a popup to replace the map's info window
            var popup = new Popup(popupOptions, domConstruct.create("div"));


            var extentInitial = new Extent({
                "xmin":1576377.090340632,
                "ymin":4268396.7084633745,
                "xmax":1624073.795990517,
                "ymax":4315864.103028405,
                "spatialReference":{
                    "wkid": 102100 //WGS_1984_Web_Mercator_Auxiliary_Sphere
                }
            });


            window.map = new Map("map", {
                basemap: "topo",
                extent:extentInitial
                //infoWindow: popup
            });

            var toggle = new BasemapToggle({
                map: map,
                basemap: "satellite"
            }, "BasemapToggle");
            toggle.startup();


            window.statesUrl = "http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/0";
            //window.outFields = ["OBJECTID", "name", "address","phone"];
            window.outFields = ["OBJECTID", "name", "address","phone","postcode", "url", "email", "locality", "category", "email", "url"];

            var flEntertainment = new FeatureLayer(window.statesUrl, {
                visible: false,
                "opacity": 0.5,
                id: "Entertainment",
                mode: FeatureLayer.MODE_ONDEMAND, // ONDEMAND, could also use FeatureLayer.MODE_ONDEMAND
                outFields: window.outFields,
                infoTemplate: popupTemplate
            });

            flEntertainment.on("load", function() {
                flEntertainment.maxScale = 0; // show the states layer at all scales
                flEntertainment.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flEntertainment.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flEntertainment.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flEntertainment.on("mouse-out", function() {
                map.setMapCursor("default");
            });


            var flHotelsFiveStar, flHotelsFourStar, flHotelsThreeStar, flHotelsTwoStar, flRestaurantsFirstClass, flRestaurantsSecondClass, flRestaurantsThirdClass, flRestaurantsSpeciality, flSnackBarsFirstClass, flSnackBarsSecondClass, flBarsWineBarsAndPubs;

            //Construct the layers

            //flEntertainment = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/0", {
            //    "opacity": 0.5,
            //    "id": "Entertainment",
            //    visible: false,
            //    mode: FeatureLayer.MODE_ONDEMAND,
            //    infoTemplate: popupTemplate,
            //    outFields: ["name", "address", "phone", "postcode", "url"]
            //});



            //mapMain.addLayer(flEntertainment);
            flHotelsFiveStar = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/1", {
                "opacity": 0.5,
                "id": "Hotel 5 starts",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flHotelsFiveStar.on("load", function() {
                flHotelsFiveStar.maxScale = 0; // show the states layer at all scales
                flHotelsFiveStar.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flHotelsFiveStar.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flHotelsFiveStar.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flHotelsFiveStar.on("mouse-out", function() {
                map.setMapCursor("default");
            });


            //mapMain.addLayer(flHotelsFiveStar);
            flHotelsFourStar = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/2", {
                "opacity": 0.5,
                "id": "Hotel 4 starts",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flHotelsFourStar.on("load", function() {
                flHotelsFourStar.maxScale = 0; // show the states layer at all scales
                flHotelsFourStar.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flHotelsFourStar.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flHotelsFourStar.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flHotelsFourStar.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flHotelsThreeStar = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/3", {
                "opacity": 0.5,
                "id": "Hotel 3 starts",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flHotelsThreeStar.on("load", function() {
                flHotelsThreeStar.maxScale = 0; // show the states layer at all scales
                flHotelsThreeStar.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flHotelsThreeStar.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flHotelsThreeStar.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flHotelsThreeStar.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flHotelsTwoStar = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/4", {
                "opacity": 0.5,
                "id": "Hotel 2 starts",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flHotelsTwoStar.on("load", function() {
                flHotelsTwoStar.maxScale = 0; // show the states layer at all scales
                flHotelsTwoStar.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flHotelsTwoStar.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flHotelsTwoStar.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flHotelsTwoStar.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flRestaurantsFirstClass = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/5", {
                "opacity": 0.5,
                "id": "Restaurants First Class",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flRestaurantsFirstClass.on("load", function() {
                flRestaurantsFirstClass.maxScale = 0; // show the states layer at all scales
                flRestaurantsFirstClass.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flRestaurantsFirstClass.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flRestaurantsFirstClass.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flRestaurantsFirstClass.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flRestaurantsSecondClass = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/6", {
                "opacity": 0.5,
                "id": "Restaurants Second Class",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flRestaurantsSecondClass.on("load", function() {
                flRestaurantsSecondClass.maxScale = 0; // show the states layer at all scales
                flRestaurantsSecondClass.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flRestaurantsSecondClass.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flRestaurantsSecondClass.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flRestaurantsSecondClass.on("mouse-out", function() {
                map.setMapCursor("default");
            });


            flRestaurantsThirdClass = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/7", {
                "opacity": 0.5,
                "id": " Restaurants Third Class",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flRestaurantsThirdClass.on("load", function() {
                flRestaurantsThirdClass.maxScale = 0; // show the states layer at all scales
                flRestaurantsThirdClass.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flRestaurantsThirdClass.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flRestaurantsThirdClass.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flRestaurantsThirdClass.on("mouse-out", function() {
                map.setMapCursor("default");
            });


            flRestaurantsSpeciality = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/8", {
                "opacity": 0.5,
                "id": " Restaurants Speciality",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flRestaurantsSpeciality.on("load", function() {
                flRestaurantsSpeciality.maxScale = 0; // show the states layer at all scales
                flRestaurantsSpeciality.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flRestaurantsSpeciality.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flRestaurantsSpeciality.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flRestaurantsSpeciality.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flSnackBarsFirstClass = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/9", {
                "opacity": 0.5,
                "id": "Snack Bars First Class",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flSnackBarsFirstClass.on("load", function() {
                flSnackBarsFirstClass.maxScale = 0; // show the states layer at all scales
                flSnackBarsFirstClass.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flSnackBarsFirstClass.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flSnackBarsFirstClass.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flSnackBarsFirstClass.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flSnackBarsSecondClass = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/10", {
                "opacity": 0.5,
                "id": "Snack Bars Second Class",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                //showLegend:true,
                outFields: window.outFields
            });
            flSnackBarsSecondClass.on("load", function() {
                flSnackBarsSecondClass.maxScale = 0; // show the states layer at all scales
                flSnackBarsSecondClass.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flSnackBarsSecondClass.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flSnackBarsSecondClass.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flSnackBarsSecondClass.on("mouse-out", function() {
                map.setMapCursor("default");
            });

            flBarsWineBarsAndPubs = new FeatureLayer("http://54.194.53.236:6080/arcgis/rest/services/Mappa/Mappa_Entertainment_v2/FeatureServer/11", {
                "opacity": 0.5,
                "id": " Bars Wine Bars And Pubs",
                visible: false,
                mode: FeatureLayer.MODE_ONDEMAND,
                infoTemplate: popupTemplate,
                outFields: window.outFields
            });
            flBarsWineBarsAndPubs.on("load", function() {
                flBarsWineBarsAndPubs.maxScale = 0; // show the states layer at all scales
                flBarsWineBarsAndPubs.setSelectionSymbol(new SimpleFillSymbol().setOutline(null).setColor("#AEC7E3"));
            });

            flBarsWineBarsAndPubs.on("click", selectGrid);

            // change cursor to indicate features are click-able
            flBarsWineBarsAndPubs.on("mouse-over", function() {
                map.setMapCursor("pointer");
            });
            flBarsWineBarsAndPubs.on("mouse-out", function() {
                map.setMapCursor("default");
            });


            // Add the layers to the map

            map.addLayers([flBarsWineBarsAndPubs,
                flSnackBarsSecondClass,
                flSnackBarsFirstClass,
                flRestaurantsSpeciality,
                flRestaurantsThirdClass,
                flRestaurantsSecondClass,
                flRestaurantsFirstClass,
                flHotelsTwoStar,
                flHotelsThreeStar,
                flHotelsFourStar,
                flHotelsFiveStar,
                flEntertainment]);



            var layerList = new LayerList({
                map: map,
                layers: [flBarsWineBarsAndPubs,
                    flSnackBarsSecondClass,
                    flSnackBarsFirstClass,
                    flRestaurantsSpeciality,
                    flRestaurantsThirdClass,
                    flRestaurantsSecondClass,
                    flRestaurantsFirstClass,
                    flHotelsTwoStar,
                    flHotelsThreeStar,
                    flHotelsFourStar,
                    flHotelsFiveStar,
                    flEntertainment]
            },"divLegend");
            //layerList.showLegend.set(true);
            layerList.startup();


            map.on("load", function( evt ){
                // show the border container now that the dijits
                // are rendered and the map has loaded
                domStyle.set(registry.byId("container").domNode, "visibility", "visible");
                populateGrid(Memory); // pass a reference to the MemoryStore constructor
            });



            function populateGrid(Memory) {
                var qt = new QueryTask(window.statesUrl);
                var query = new Query();
                query.where = "1=1";
                query.returnGeometry = false;
                query.outFields = window.outFields;
                qt.execute(query, function(results) {
                    var data = array.map(results.features, function(feature) {
                        return {
                            // property names used here match those used when creating the dgrid
                            "id": feature.attributes[window.outFields[0]],
                            "name": feature.attributes[window.outFields[1]],
                            "address": feature.attributes[window.outFields[2]],
                            "phone": feature.attributes[window.outFields[3]],
                            "postcode": feature.attributes[window.outFields[4]],
                            "url": feature.attributes[window.outFields[5]],
                            "email": feature.attributes[window.outFields[6]],
                            "locality": feature.attributes[window.outFields[7]],
                            "category": feature.attributes[window.outFields[8]]
                        };
                    });
                    var memStore = new Memory({ data: data });
                    window.grid.set("store", memStore);
                });
            }
            // fires when a row in the dgrid is clicked
            function selectState(e) {
                // select the feature

                var fl = map.getLayer("Entertainment");
                var query = new Query();
                query.objectIds = [parseInt(e.target.innerHTML, 10)];
                console.log("query = ", query);
                //query.objectIds = e.graphic.attributes.OBJECTID;
                fl.selectFeatures(query, FeatureLayer.SELECTION_NEW, function(result) {
                    if ( result.length ) {
                        // re-center the map to the selected feature
                        window.map.setZoom(16);
                        window.map.centerAt(result[0].geometry);
                        //window.map.setZoom(map.getZoom()+1);

                    } else {
                        console.log("Feature Layer query returned no features... ", result);
                    }
                });
            }

            // fires when a feature on the map is clicked
            function selectGrid(e) {
                var id = e.graphic.attributes.OBJECTID;
                // select the feature that was clicked
                var query = new Query();
                query.objectIds = [id];
                var states = map.getLayer("Entertainment");
                states.selectFeatures(query, FeatureLayer.SELECTION_NEW);
                // select the corresponding row in the grid
                // and make sure it is in view
                grid.clearSelection();
                grid.select(id);
                grid.row(id).element.scrollIntoView();
            }
        }
    );
});