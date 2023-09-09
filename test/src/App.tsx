import { useState ,useEffect} from 'react'
import * as THREE from  'three';
import { MeshBasicMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './App.css';



function App() {
  useEffect(()=>{
            const scene = new THREE.Scene();//场景
            const geometry=new THREE.BoxGeometry(100,100,100);//几何体
            const material =new MeshBasicMaterial({//材质
                color:0x00ff,
                transparent:true,
                opacity:0.5
            })
            const mesh =new THREE.Mesh(geometry,material);
            mesh.position.set(0,0,0);
            const axesHelper=new THREE.AxesHelper(5000);//坐标轴辅助线
            scene.add(axesHelper);
            scene.add(mesh);

            const width=window.innerWidth;
            const height=window.innerHeight;

            const camera =new THREE.PerspectiveCamera(30,width/height,5,3000);//相机（场景角度，画布宽高比，近裁截面，远裁截面）
            camera.position.set(700,700,700);
            camera.lookAt(0,0,0);

            const renderer = new THREE.WebGL1Renderer(); // 渲染器
            renderer.setSize(width, height);
            const container:HTMLElement = document.getElementById('canvas')!; // 获取容器元素
            container.appendChild(renderer.domElement);

            const controls=new OrbitControls(camera,renderer.domElement)
            controls.enableDamping=true//设置惯性
            controls.dampingFactor=0.01//阻尼系数
            // controls.autoRotate=true//自动旋转

            
            function animate() {
              controls.update()
              mesh.rotation.x+=0.01;
              mesh.rotation.y+=0.01;
              renderer.render(scene,camera);
              requestAnimationFrame(animate);
            }
            animate(); // 启动动画
            
  })

  return (
    <>
     <div id="canvas"></div>
    </>
  )
}

export default App
