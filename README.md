# XMUT 3D City｜高校三维可视化系统

基于 CesiumJS 的浏览器端三维可视化项目，使用 GeoJSON 建筑轮廓构建三维白模，并提供底图切换、视角控制、校园环绕飞行、天气后处理和坐标显示等功能。

## 技术栈
- CesiumJS
- JavaScript / HTML / CSS
- GeoJSON
- GLSL / PostProcessStage

## 主要功能
- GeoJSON 建筑数据加载与 `extrudedHeight` 三维拉伸
- OpenStreetMap / Esri World Imagery 底图切换
- 多高校定位与视角切换
- `Camera.flyTo`、`lookAt`、`HeadingPitchRange` 相机控制
- 校园环绕飞行
- 雨雪天气后处理效果
- 网格、瓦片坐标和鼠标经纬度显示

## 本地运行
项目使用 CDN 加载 CesiumJS，不需要 Cesium ion Token。建议使用 VS Code Live Server 或其他本地 HTTP 服务器运行，避免浏览器直接打开 `file://` 时限制 GeoJSON 请求。

## 数据与安全
项目使用 GeoJSON 建筑数据。仓库不包含个人访问令牌或地图服务密钥。