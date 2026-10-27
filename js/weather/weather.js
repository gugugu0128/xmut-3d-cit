// 天气后处理效果 - 优化版 GLSL 着色器
// 优化版下雨 Shader：雨丝细化、斜向飘落、阴天效果
const rainShader = `
    uniform sampler2D colorTexture;
    varying vec2 v_textureCoordinates;
    void main(void) {
        vec4 color = texture2D(colorTexture, v_textureCoordinates);
        float time = czm_frameNumber / 60.0;
        
        vec2 uv = v_textureCoordinates;
        uv.x -= uv.y * 0.2;

        vec2 st = uv * vec2(800.0, 20.0);
        st.y += time * 15.0;

        float rain = fract(sin(dot(floor(st), vec2(12.9898, 78.233))) * 43758.5453);

        if (rain > 0.98) {
            color.rgb = mix(color.rgb, vec3(0.7, 0.8, 0.9), 0.4);
        }
        
        color.rgb *= 0.85;
        gl_FragColor = color;
    }
`;

// 优化版下雪 Shader：增加密度，并叠加雾霾效果
const snowShader = `
    uniform sampler2D colorTexture;
    varying vec2 v_textureCoordinates;
    float snow(vec2 uv, float scale) {
        float time = czm_frameNumber / 60.0;
        float w = smoothstep(1., 0., -uv.y * (scale / 10.));
        if (w < .1) return 0.;
        uv += time / scale;
        uv.y += time * 2. / scale;
        uv.x += sin(uv.y + time * .5) / scale;
        uv *= scale;
        vec2 s = floor(uv), f = fract(uv), p;
        float k = 3., d;
        p = .5 + .35 * sin(11. * fract(sin((s + p + scale) * mat2(7, 3, 6, 5)) * 5.)) - f;
        d = length(p);
        k = min(d, k);
        k = smoothstep(0., k, sin(f.x + f.y) * 0.01);
        return k * w;
    }
    void main(void) {
        vec4 color = texture2D(colorTexture, v_textureCoordinates);
        vec2 uv = (gl_FragCoord.xy * 2. - czm_viewport.zw) / min(czm_viewport.z, czm_viewport.w);
        float fogIntensity = 0.35;
        vec3 fogColor = vec3(0.85, 0.85, 0.85);
        color.rgb = mix(color.rgb, fogColor, fogIntensity);
        float c = 0.0;
        c += snow(uv, 30.) * 0.4;
        c += snow(uv, 20.) * 0.7;
        c += snow(uv, 15.) * 1.0;
        c += snow(uv, 10.) * 1.3;
        c += snow(uv, 8.) * 1.5;
        color.rgb = mix(color.rgb, vec3(1.0, 1.0, 1.0), c);
        gl_FragColor = color;
    }
`;

// 天气管理变量
let snowStage = null;
let rainStage = null;

// 天气切换函数
function changeWeather(type) {
    // 先移除现有的所有特效
    if (snowStage) {
        viewer.scene.postProcessStages.remove(snowStage);
        snowStage = null;
    }
    if (rainStage) {
        viewer.scene.postProcessStages.remove(rainStage);
        rainStage = null;
    }

    // 按需添加新特效
    if (type === 'snow') {
        snowStage = new Cesium.PostProcessStage({ fragmentShader: snowShader });
        viewer.scene.postProcessStages.add(snowStage);
    } else if (type === 'rain') {
        rainStage = new Cesium.PostProcessStage({ fragmentShader: rainShader });
        viewer.scene.postProcessStages.add(rainStage);
    }
}