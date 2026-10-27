// 厦门理工学院环绕飞行
let removeFlightTick = null;
let orbitHeading = 0;

const FLIGHT_LONGITUDE = 118.082;
const FLIGHT_LATITUDE = 24.627;
const FLIGHT_TARGET_HEIGHT = 50;
const FLIGHT_RANGE = 800;
const FLIGHT_PITCH = Cesium.Math.toRadians(-25);
const FLIGHT_ANGULAR_SPEED = Cesium.Math.toRadians(10);

/**
 * 开始环绕飞行。
 * 使用 HeadingPitchRange 在目标点局部东-北-天坐标系中环绕，
 * 禁止直接修改 ECEF 坐标的 x、y、z。
 */
function startOrbitFlight() {
    // 防止重复注册 onTick 监听器
    if (removeFlightTick) {
        return;
    }

    // 取消可能正在执行的 flyTo
    viewer.camera.cancelFlight();

    const center = Cesium.Cartesian3.fromDegrees(
        FLIGHT_LONGITUDE,
        FLIGHT_LATITUDE,
        FLIGHT_TARGET_HEIGHT
    );

    let lastTimestamp = performance.now();

    // 先立即设置一次正确视角
    viewer.camera.lookAt(
        center,
        new Cesium.HeadingPitchRange(
            orbitHeading,
            FLIGHT_PITCH,
            FLIGHT_RANGE
        )
    );

    // addEventListener 返回一个注销函数，停止时必须直接调用
    removeFlightTick = viewer.clock.onTick.addEventListener(function () {
        const currentTimestamp = performance.now();

        // 使用时间差控制速度，避免速度受显示器帧率影响
        const deltaSeconds = Math.min(
            (currentTimestamp - lastTimestamp) / 1000,
            0.1
        );

        lastTimestamp = currentTimestamp;

        orbitHeading =
            (orbitHeading + FLIGHT_ANGULAR_SPEED * deltaSeconds) %
            (Math.PI * 2);

        viewer.camera.lookAt(
            center,
            new Cesium.HeadingPitchRange(
                orbitHeading,
                FLIGHT_PITCH,
                FLIGHT_RANGE
            )
        );
    });
}

/**
 * 停止环绕飞行并恢复世界坐标参考系。
 */
function stopFlight() {
    if (removeFlightTick) {
        removeFlightTick();
        removeFlightTick = null;
    }

    // lookAt 会把相机放入目标点局部参考系，
    // 停止后必须恢复到世界坐标参考系
    viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
}