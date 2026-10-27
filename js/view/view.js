/**
 * 视角切换模块
 *
 * 只改变当前地图区域的观察角度，
 * 不跳转到固定经纬度，不改变底图。
 */
(function (global) {
    'use strict';

    let viewerInstance = null;
    let initialized = false;

    /**
     * 初始化视角切换模块。
     *
     * @param {Cesium.Viewer} viewer Cesium Viewer
     */
    function initViewSwitcher(viewer) {
        if (!viewer) {
            console.error(
                '视角切换模块初始化失败：未传入 Cesium Viewer。'
            );
            return false;
        }

        if (initialized) {
            console.warn(
                '视角切换模块已经初始化，忽略重复初始化。'
            );
            return true;
        }

        viewerInstance = viewer;
        initialized = true;

        console.info('视角切换模块初始化完成。');
        return true;
    }

    /**
     * 解除 camera.lookAt 创建的目标点局部参考系，
     * 恢复 Cesium 默认世界坐标相机控制。
     *
     * 调用后保持当前相机世界位置和观察方向不变。
     */
    function releaseCameraControl() {
        if (!viewerInstance) {
            return;
        }

        const camera = viewerInstance.camera;
        const controller =
            viewerInstance.scene.screenSpaceCameraController;

        // 解除 lookAt 对目标点局部参考系的绑定
        camera.lookAtTransform(
            Cesium.Matrix4.IDENTITY
        );

        // 恢复所有常用鼠标控制
        controller.enableRotate = true;
        controller.enableTranslate = true;
        controller.enableZoom = true;
        controller.enableTilt = true;
        controller.enableLook = true;
    }

    /**
     * 获取当前屏幕中心在地球表面的位置。
     *
     * @returns {Cesium.Cartesian3|null}
     */
    function getCurrentViewCenter() {
        if (!viewerInstance) {
            return null;
        }

        const scene = viewerInstance.scene;
        const camera = viewerInstance.camera;
        const canvas = scene.canvas;

        const width =
            canvas.clientWidth || canvas.width;

        const height =
            canvas.clientHeight || canvas.height;

        if (width <= 0 || height <= 0) {
            return null;
        }

        const screenCenter =
            new Cesium.Cartesian2(
                width / 2,
                height / 2
            );

        let center = null;

        const ray =
            camera.getPickRay(screenCenter);

        if (Cesium.defined(ray)) {
            center = scene.globe.pick(
                ray,
                scene
            );
        }

        if (!Cesium.defined(center)) {
            center = camera.pickEllipsoid(
                screenCenter,
                scene.globe.ellipsoid
            );
        }

        return Cesium.defined(center)
            ? center
            : null;
    }

    /**
     * 只改变当前区域观察角度，
     * 保持当前中心区域和缩放距离。
     *
     * @param {number} pitchDegrees 目标俯仰角
     */
    function changeCurrentViewPitch(
        pitchDegrees
    ) {
        if (!viewerInstance) {
            console.warn(
                '视角切换模块尚未初始化。'
            );
            return;
        }

        const camera =
            viewerInstance.camera;

        camera.cancelFlight();

        const center =
            getCurrentViewCenter();

        const targetPitch =
            Cesium.Math.toRadians(
                pitchDegrees
            );

        if (!center) {
            camera.setView({
                destination:
                    Cesium.Cartesian3.clone(
                        camera.positionWC
                    ),

                orientation: {
                    heading: camera.heading,
                    pitch: targetPitch,
                    roll: 0
                }
            });

            releaseCameraControl();

            viewerInstance.scene.requestRender();

            console.warn(
                '屏幕中心未命中地球，已仅调整相机朝向。'
            );

            return;
        }

        const range =
            Cesium.Cartesian3.distance(
                camera.positionWC,
                center
            );

        if (
            !Number.isFinite(range) ||
            range <= 1
        ) {
            console.warn(
                '当前相机距离无效，无法切换视角：',
                range
            );

            releaseCameraControl();
            return;
        }

        const heading =
            camera.heading;

        camera.lookAt(
            center,
            new Cesium.HeadingPitchRange(
                heading,
                targetPitch,
                range
            )
        );

        // 关键修复：解除围绕中心点的参考系锁定
        releaseCameraControl();

        viewerInstance.scene.requestRender();
    }

    /**
     * 视角切换入口。
     *
     * initial：当前区域俯视
     * city15：当前区域倾斜视角
     *
     * @param {string} type
     */
    function setView(type) {
        if (!initialized || !viewerInstance) {
            console.warn(
                '视角切换模块尚未初始化，无法执行。'
            );
            return;
        }

        /**
         * 先停止环绕飞行，避免 onTick
         * 在下一帧覆盖视角调整结果。
         */
        if (
            typeof global.stopFlight ===
            'function'
        ) {
            global.stopFlight();
        }

        viewerInstance.camera.cancelFlight();

        if (type === 'initial') {
            changeCurrentViewPitch(-90);

            console.info(
                '已切换为当前区域俯视视角。'
            );
            return;
        }

        if (type === 'city15') {
            changeCurrentViewPitch(-15);

            console.info(
                '已切换为当前区域15°视角。'
            );
            return;
        }

        console.warn(
            '未知的视角类型：',
            type
        );
    }

    global.initViewSwitcher =
        initViewSwitcher;

    global.setView =
        setView;
})(window);