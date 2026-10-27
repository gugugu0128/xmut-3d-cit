/**
 * 高校视角切换模块
 *
 * 所有坐标集中保存在 CAMPUS_CONFIG 中。
 * Cesium 使用经度、纬度顺序。
 *
 * 坐标为校区近似中心点，后续可根据项目底图进行微调。
 */
(function (global) {
    'use strict';

    let viewerInstance = null;
    let initialized = false;
    let currentCampus = 'xmut-jimei';

    /**
     * 高校校区配置。
     *
     * longitude：经度
     * latitude：纬度
     * height：相机高度
     * heading：航向角，单位为度
     * pitch：俯仰角，单位为度
     */
    const CAMPUS_CONFIG = Object.freeze({
        'xmu-siming': {
            name: '厦门大学思明校区',
            longitude: 118.09480,
            latitude: 24.42425,
            height: 1700,
            heading: 0,
            pitch: -45
        },

        'xmu-xiangan': {
            name: '厦门大学翔安校区',
            longitude: 118.3100,
            latitude: 24.59350,
            height: 2500,
            heading: 0,
            pitch: -50
        },

        'xmut-jimei': {
            name: '厦门理工学院集美校区',
            longitude: 118.08283,
            latitude: 24.61786,
            height: 1000,
            heading: 0,
            pitch: -45
        },

        'xmut-siming': {
            name: '厦门理工学院思明校区',
            longitude: 118.08572,
            latitude: 24.43204,
            height: 1200,
            heading: 0,
            pitch: -45
        },

        'hqu-xiamen': {
            name: '华侨大学厦门校区',
            longitude: 118.08151,
            latitude: 24.59177,
            height: 1900,
            heading: 0,
            pitch: -45
        },

        'jmu': {
            name: '集美大学',
            longitude: 118.09176,
            latitude: 24.56452,
            height: 2000,
            heading: 0,
            pitch: -45
        }
    });

    /**
     * 更新高校菜单选中状态。
     *
     * @param {string} campusId 校区 ID
     */
    function updateCampusMenuState(campusId) {
        const options = document.querySelectorAll(
            '.campus-option'
        );

        options.forEach(function (option) {
            const active =
                option.dataset.campus === campusId;

            option.classList.toggle(
                'active',
                active
            );

            option.setAttribute(
                'aria-current',
                active ? 'true' : 'false'
            );
        });
    }

    /**
     * 初始化高校切换模块。
     *
     * 必须在 Cesium Viewer 创建完成后调用。
     *
     * @param {Cesium.Viewer} viewer Cesium Viewer
     * @returns {boolean} 初始化是否成功
     */
    function initCampusSwitcher(viewer) {
        if (!viewer) {
            console.error(
                '高校切换模块初始化失败：未传入 Cesium Viewer。'
            );
            return false;
        }

        if (initialized) {
            console.warn(
                '高校切换模块已初始化，忽略重复初始化。'
            );
            return true;
        }

        viewerInstance = viewer;
        initialized = true;
        currentCampus = 'xmut-jimei';

        // 初始化时飞向默认校区
        const defaultCampus = CAMPUS_CONFIG[currentCampus];
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                defaultCampus.longitude,
                defaultCampus.latitude,
                defaultCampus.height
            ),
            orientation: {
                heading: Cesium.Math.toRadians(defaultCampus.heading),
                pitch: Cesium.Math.toRadians(defaultCampus.pitch),
                roll: 0
            },
            duration: 3
        });

        updateCampusMenuState(currentCampus);

        console.info(
            '高校切换模块初始化完成，当前校区：',
            CAMPUS_CONFIG[currentCampus].name
        );

        return true;
    }

    /**
     * 停止可能存在的相机动画和环绕飞行。
     */
    function stopCurrentCameraAction() {
        if (!viewerInstance) {
            return;
        }

        // 停止正在执行的 Cesium flyTo 动画
        viewerInstance.camera.cancelFlight();

        // 停止环绕飞行
        if (typeof stopFlight === 'function') {
            stopFlight();
        }
    }

    /**
     * 切换到指定高校校区。
     *
     * @param {string} campusId 校区 ID
     */
    function switchCampus(campusId) {
        if (!initialized || !viewerInstance) {
            console.error('高校切换模块未初始化。');
            return;
        }

        const config = CAMPUS_CONFIG[campusId];
        if (!config) {
            console.warn('未知的校区 ID：', campusId);
            return;
        }

        if (campusId === currentCampus) {
            return;
        }

        // 停止当前相机动作
        stopCurrentCameraAction();

        // 执行飞向新校区
        viewerInstance.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(
                config.longitude,
                config.latitude,
                config.height
            ),
            orientation: {
                heading: Cesium.Math.toRadians(config.heading),
                pitch: Cesium.Math.toRadians(config.pitch),
                roll: 0
            },
            duration: 2
        });

        currentCampus = campusId;
        updateCampusMenuState(campusId);

        console.info('已切换到：', config.name);
    }

    /**
     * 获取当前校区 ID。
     *
     * @returns {string} 当前校区 ID
     */
    function getCurrentCampus() {
        return currentCampus;
    }

    // 暴露到全局
    global.initCampusSwitcher = initCampusSwitcher;
    global.switchCampus = switchCampus;
    global.getCurrentCampus = getCurrentCampus;

})(window);