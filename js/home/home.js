// 返回首页
function goHome() {
    if (!viewer) {
        return;
    }

    // 先注销环绕飞行回调，否则 flyTo 会在下一帧被覆盖
    if (typeof stopFlight === 'function') {
        stopFlight();
    }

    viewer.camera.cancelFlight();

    viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
            118.08283,
            24.61786,
            1000
        ),
        orientation: {
            heading: 0,
            pitch: Cesium.Math.toRadians(-45),
            roll: 0
        },
        duration: 2
    });
}