// 二维道路地图：OpenStreetMap，不需要 Cesium ion Token
const streetMapProvider =
    new Cesium.OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
    });

// 卫星地图：Esri World Imagery，不需要 Cesium ion Token
const satelliteMapProvider =
    new Cesium.UrlTemplateImageryProvider({
        url:
            'https://services.arcgisonline.com/' +
            'ArcGIS/rest/services/World_Imagery/' +
            'MapServer/tile/{z}/{y}/{x}',

        tilingScheme:
            new Cesium.WebMercatorTilingScheme(),

        maximumLevel: 19,

        credit: new Cesium.Credit(
            'Tiles &copy; Esri'
        )
    });

// 底图加载失败只输出警告，不能中断页面
streetMapProvider.errorEvent.addEventListener(
    function (error) {
        console.warn(
            'OpenStreetMap 瓦片加载失败，请检查网络连接。',
            error
        );
    }
);

satelliteMapProvider.errorEvent.addEventListener(
    function (error) {
        console.warn(
            '卫星影像瓦片加载失败，请检查网络连接或服务状态。',
            error
        );
    }
);

// 存储底图图层引用
let streetMapLayer = null;
let satelliteMapLayer = null;
let currentBaseMap = 'street';

/**
 * 初始化底图图层。
 * 必须在 Viewer 创建后调用。
 */
function initBaseMapLayers() {
    // Viewer 创建时已经添加了 OpenStreetMap，取得该图层引用
    streetMapLayer = viewer.imageryLayers.get(0);

    // 将卫星地图加入为第二个基础图层
    satelliteMapLayer = viewer.imageryLayers.addImageryProvider(
        satelliteMapProvider,
        1
    );

    // 默认显示二维地图，隐藏卫星地图
    streetMapLayer.show = true;
    satelliteMapLayer.show = false;
}

/**
 * 切换基础地图。
 * street：二维道路地图
 * satellite：卫星地图
 */
function switchBaseMap(type) {
    if (
        type !== 'street' &&
        type !== 'satellite'
    ) {
        console.warn(
            '未知的底图类型：',
            type
        );
        return;
    }

    if (type === currentBaseMap) {
        return;
    }

    if (type === 'street') {
        streetMapLayer.show = true;
        satelliteMapLayer.show = false;
    } else {
        streetMapLayer.show = false;
        satelliteMapLayer.show = true;
    }

    currentBaseMap = type;

    // 更新菜单选中状态
    const options = document.querySelectorAll(
        '.basemap-option'
    );

    options.forEach(function (option) {
        const isActive =
            option.dataset.basemap === type;

        option.classList.toggle(
            'active',
            isActive
        );
    });

    console.info(
        type === 'street'
            ? '已切换到二维地图'
            : '已切换到卫星地图'
    );
}

// 明确暴露给 HTML onclick
window.switchBaseMap = switchBaseMap;