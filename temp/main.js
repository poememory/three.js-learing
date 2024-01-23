import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();//场景
const canvas=document.getElementById('c')
const backgroundColor=0xf1f1f1;
scene.background=new THREE.Color(backgroundColor)
scene.fog=new THREE.Fog(backgroundColor,60,100)
let model,//人物模型
    mixer,//动画播放器，大动画内容对象
    possibleAnims,
    idle;//空闲动画
let waist,neck;//腰和脖子骨架
let clock=new THREE.Clock;//后面改帧动画为时间长度

const width=window.innerWidth;
const height=window.innerHeight;

const camera =new THREE.PerspectiveCamera(50,width/height,0.1,1000);
camera.position.set(0,-3,30);

// Add lights
//半球光源
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);//两个颜色参数和一个强度参数
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);
// 平行光源
let d = 8.25;
let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;//阴影投射功能
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);//阴影的分辨率
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 1500;
dirLight.shadow.camera.left = d * -1;
dirLight.shadow.camera.right = d;
dirLight.shadow.camera.top = d;
dirLight.shadow.camera.bottom = d * -1;//光源视锥体的边界
scene.add(dirLight);

// 地板
let floorGeometry = new THREE.PlaneGeometry(50000, 50000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0,//高光度
});
let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -11;
scene.add(floor);

let geometry = new THREE.SphereGeometry(8, 32, 32);
let material = new THREE.MeshBasicMaterial({ color: 0x9bffaf }); // 0xf2ce2e 
let sphere = new THREE.Mesh(geometry, material);
sphere.position.z = -15;
sphere.position.y = -2.5;
sphere.position.x = -0.25;
scene.add(sphere);

const renderer = new THREE.WebGLRenderer({canvas,antialias:true}); // 渲染器
renderer.shadowMap.enabled=true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width,height)
document.body.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement)

//人物模型
const MODEL_PATH = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy_lightweight.glb';
//人物材质
let stacy_txt = new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/1376484/stacy.jpg');
stacy_txt.flipY = false; 
const stacy_mtl = new THREE.MeshPhongMaterial({
  map: stacy_txt,
  color: 0xffffff,
  skinning: true
});

var loader = new GLTFLoader();
loader.load(//加载完的回调函数
  MODEL_PATH,//参数-模型
  function(gltf) {
   model=gltf.scene;
   //模型赋值
   let fileAnimations=gltf.animations;
   //获取模型中的动画内容
   model.traverse(o=>{//遍历模型中的组成模块
    if(o.isMesh){//判断是否是网格模块
      o.castShadow=true;
      o.receiveShadow=true//为网格模块设置阴影
      o.material=stacy_mtl//为各个模块设置材质
    }
    if (o.isBone && o.name === 'mixamorigNeck') { 
      neck = o;//找到脖子骨架
    }
    if (o.isBone && o.name === 'mixamorigSpine') { 
      waist = o;//找到腰骨架
    }
   })
   model.position.y=-11
   model.scale.set(7,7,7)//放大模型
   scene.add(model)
   mixer=new THREE.AnimationMixer(model)
   let clips = fileAnimations.filter(val => val.name !== 'idle');
   //找到除空闲动画外的动画内容
   possibleAnims = clips.map(val => {
    let clip = THREE.AnimationClip.findByName(clips, val.name);
    clip.tracks.splice(3, 3);
    clip.tracks.splice(9, 3);
    clip = mixer.clipAction(clip);
    return clip;
   }
  );
    let idleAnim=THREE.AnimationClip.findByName(fileAnimations,'idle')
    //找到空闲动画
    idleAnim.tracks.splice(3, 3);
    idleAnim.tracks.splice(9, 3);
    idle=mixer.clipAction(idleAnim)
    idle.play()
  },
  undefined, 
  function(error) {
    console.error(error);
  }
);


function resizeRendererToDisplaySize(renderer) {//调整页面的大小
  const canvas = renderer.domElement;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;
  const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function animate() {
  if(mixer){
    mixer.update(clock.getDelta())//人物的动画
  }
  if(resizeRendererToDisplaySize(renderer)){
    const canvas=renderer.domElement;
    camera.aspect=canvas.clientWidth/canvas.clientHeight;
    camera.updateProjectionMatrix()
  }
  controls.update()//控制器更新
  renderer.render(scene,camera);//渲染场景与相机
  requestAnimationFrame(animate);
}
animate(); // 启动动画



function getMousePos(e) {
  return { x: e.clientX, y: e.clientY };
}
function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);//角度转弧度
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
}
function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
      dy = 0,//X和Y方向的旋转角度
      xdiff,
      ydiff,//鼠标位置与屏幕中心的差异值
      xPercentage,
      yPercentage;//X和Y方向上的偏移百分比
  let w = { x: window.innerWidth, y: window.innerHeight };
  if (x <= w.x / 2) {
    xdiff = w.x / 2 - x;  
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = ((degreeLimit * xPercentage) / 100) * -1; }
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
    }
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
}
document.addEventListener('mousemove', function(e) {
  var mousecoords = getMousePos(e);
if (neck && waist) {
    moveJoint(mousecoords, neck, 50);
    moveJoint(mousecoords, waist, 30);
}
});

let raycaster=new THREE.Raycaster();//声明并初始化raycaster对象，用于射线投射：
let currentlyAnimating=false;//播放状态
window.addEventListener('click', e => raycast(e));
function raycast(e) {
  var mouse = {};
    mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
    mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects[0]) {
    var object = intersects[0].object;
    if (object.name === 'stacy') {
      if (!currentlyAnimating) {
        currentlyAnimating = true;
        playOnClick();
      }
    }
  }
}
function playOnClick() {
  let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
  playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
}
function playModifierAnimation(from, fSpeed, to, tSpeed) {//在 playOnClick 函数中，通过随机选择 possibleAnims 数组中的一个动画索引 anim，从 idle 动画过渡到 possibleAnims[anim] 动画。
  to.setLoop(THREE.LoopOnce);
  to.reset();//重置目标动画的播放状态
  to.play();
  from.crossFadeTo(to, fSpeed, true);//在指定的时间内将起始动画淡出并将目标动画淡入。fSpeed参数是淡出的持续时间
  setTimeout(function() {//播放定时器的回调
    from.enabled = true;//启动原来的动画，此处为idle
    to.crossFadeTo(from, tSpeed, true);
    currentlyAnimating = false;//设置播放完毕状态
  }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
}

