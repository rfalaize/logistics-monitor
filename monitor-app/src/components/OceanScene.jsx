import React, { Component } from "react";
import * as THREE from "three";

class OceanScene extends Component {
  componentDidMound() {
    this.init();
    this.animate();
  }

  init() {
    this.container = document.getElementById("container");
    // create renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.container.appendChild(this.renderer.domElement);
    // create scene
    this.scene = new THREE.Scene();
    // create camera
    this.camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      1,
      20000
    );
    this.camera.position.set(30, 30, 100);
    // add light
    this.light = new THREE.DirectionalLight(0xffffff, 0.8);
    this.scene.add(this.light);
    // add water
    var waterGeometry = new THREE.PlaneBufferGeometry(10000, 10000);
    this.water = new THREE.Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        "textures/waternormals.jpg",
        function(texture) {
          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        }
      ),
      alpha: 1.0,
      sunDirection: this.light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined
    });
    this.water.rotation.x = -Math.PI / 2;
    this.scene.add(this.water);
    // add skybox
    var sky = new THREE.Sky();
    var uniforms = sky.material.uniforms;
    uniforms["turbidity"].value = 10;
    uniforms["rayleigh"].value = 2;
    uniforms["luminance"].value = 1;
    uniforms["mieCoefficient"].value = 0.005;
    uniforms["mieDirectionalG"].value = 0.8;
    this.sunParameters = {
      distance: 400,
      inclination: 0.49,
      azimuth: 0.205
    };
    this.cubeCamera = new THREE.CubeCamera(0.1, 1, 512);
    this.cubeCamera.renderTarget.texture.generateMipmaps = true;
    this.cubeCamera.renderTarget.texture.minFilter =
      THREE.LinearMipMapLinearFilter;
    this.scene.background = this.cubeCamera.renderTarget;

    this.updateSun();
    //
    var geometry = new THREE.IcosahedronBufferGeometry(20, 1);
    var count = geometry.attributes.position.count;
    var colors = [];
    var color = new THREE.Color();
    for (var i = 0; i < count; i += 3) {
      color.setHex(Math.random() * 0xffffff);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
      colors.push(color.r, color.g, color.b);
    }
    geometry.addAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    var material = new THREE.MeshStandardMaterial({
      vertexColors: THREE.VertexColors,
      roughness: 0.0,
      flatShading: true,
      envMap: this.cubeCamera.renderTarget.texture,
      side: THREE.DoubleSide
    });
    this.sphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.sphere);
    //
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.maxPolarAngle = Math.PI * 0.495;
    this.controls.target.set(0, 10, 0);
    this.controls.minDistance = 40.0;
    this.controls.maxDistance = 200.0;
    this.controls.update();
    //
    this.stats = new THREE.stats();
    this.container.appendChild(this.stats.dom);
    // GUI
    var gui = new THREE.dat.GUI();
    var folder = gui.addFolder("Sky");
    folder
      .add(this.sunParameters, "inclination", 0, 0.5, 0.0001)
      .onChange(this.updateSun);
    folder
      .add(this.sunParameters, "azimuth", 0, 1, 0.0001)
      .onChange(this.updateSun);
    folder.open();

    var materialUniforms = this.water.material.uniforms;
    folder = gui.addFolder("Water");
    folder
      .add(materialUniforms.distortionScale, "value", 0, 8, 0.1)
      .name("distortionScale");
    folder.add(materialUniforms.size, "value", 0.1, 10, 0.1).name("size");
    folder.add(materialUniforms.alpha, "value", 0.9, 1, 0.001).name("alpha");
    folder.open();
    //
    window.addEventListener("resize", this.onWindowResize, false);
  }

  updateSun() {
    var theta = Math.PI * (this.sunParameters.inclination - 0.5);
    var phi = 2 * Math.PI * (this.sunParameters.azimuth - 0.5);
    this.light.position.x = this.sunParameters.distance * Math.cos(phi);
    this.light.position.y =
      this.sunParameters.distance * Math.sin(phi) * Math.sin(theta);
    this.light.position.z =
      this.sunParameters.distance * Math.sin(phi) * Math.cos(theta);
    this.sky.material.uniforms["sunPosition"].value = this.light.position.copy(
      this.light.position
    );
    this.water.material.uniforms["sunDirection"].value
      .copy(this.light.position)
      .normalize();
    this.cubeCamera.update(this.renderer, this.sky);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  animate() {
    requestAnimationFrame(this.animate);
    this.renderScene();
    this.stats.update();
  }
  renderScene() {
    var time = performance.now() * 0.001;
    this.sphere.position.y = Math.sin(time) * 20 + 5;
    this.sphere.rotation.x = time * 0.5;
    this.sphere.rotation.z = time * 0.51;
    this.water.material.uniforms["time"].value += 1.0 / 60.0;
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        style={{ width: "400px", height: "400px" }}
        ref={mount => {
          this.mount = mount;
        }}
      />
    );
  }
}

export default OceanScene;
