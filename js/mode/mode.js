// 网格与瓦片图层变量
let gridLayer = null;
let tileLayer = null;

// 网格模式
function toggleGrid(show) {
    if (show && !gridLayer) {
        gridLayer = viewer.imageryLayers.addImageryProvider(new Cesium.GridImageryProvider({
            color: Cesium.Color.WHITE.withAlpha(0.6),
            cellAlpha: 0.0
        }));
    } else if (!show && gridLayer) {
        viewer.imageryLayers.remove(gridLayer);
        gridLayer = null;
    }
}

// 瓦片模式
function toggleTiles(show) {
    if (show && !tileLayer) {
        tileLayer = viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider({
            color: Cesium.Color.YELLOW,
            labelColor: Cesium.Color.YELLOW
        }));
    } else if (!show && tileLayer) {
        viewer.imageryLayers.remove(tileLayer);
        tileLayer = null;
    }
}