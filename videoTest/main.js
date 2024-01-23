
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// 创建场景
var scene = new THREE.Scene();

// 创建相机
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 5);

// 创建 WebGL 渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 创建 VR 视频纹理
var video = document.createElement('video');
video.src = '/VID_20231125_132828.mp4';
video.crossOrigin = 'anonymous'; // 跨域时需要设置
video.loop = true;
video.play();

var videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;

// 创建立方体几何体
var geometry = new THREE.BoxGeometry(3, 3, 3);

// 创建材质
var material = new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.DoubleSide });

// 创建网格对象
var cube = new THREE.Mesh(geometry, material);

// 将立方体添加到场景中
scene.add(cube);
const controls=new OrbitControls(camera,renderer.domElement)
// 渲染函数
function animate() {
    requestAnimationFrame(animate);

    // 旋转立方体
    cube.rotation.x += 0.001;
    cube.rotation.y += 0.001;

    // 更新视频纹理
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        videoTexture.needsUpdate = true;
    }
    controls.update()
    // 渲染场景
    renderer.render(scene, camera);

}

// 监听窗口大小变化
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 开始动画
document.addEventListener("click",()=>animate());