import {
  Component,
  ElementRef,
  signal,
  ViewChild,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { ProgressSpinner } from 'primeng/progressspinner';
import { DecimalPipe } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-about',
  imports: [ProgressSpinner, DecimalPipe, AccordionModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;
  private themeService = inject(ThemeService);

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private model!: THREE.Group;
  private animationFrameId!: number;

  isModelLoaded = signal(false);
  loadingProgress = signal(0);

  //Mouse interaction state
  private isDragging = false;
  private previousMouseX = 0;
  private targetRotationY = 0;
  private currentRotationY = 0;
  private autoRotate = true;
  private autoRotateTimeout: any;

  //Performance optimization
  private lastFrameTime = 0;
  private targetFPS = 60;
  private frameInterval = 1000 / this.targetFPS;
  private intersectionObserver?: IntersectionObserver;

  ngOnInit() {
    this.initThreeJS();
    this.loadModel();
    this.setupMouseEvents();
    this.setupPerformanceOptimization();
    this.animate();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    if (this.model) {
      this.scene.remove(this.model);
    }

    if (this.autoRotateTimeout) {
      clearTimeout(this.autoRotateTimeout);
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    window.removeEventListener('resize', this.onWindowResize.bind(this));
  }

  private initThreeJS() {
    const canvas = this.canvasRef.nativeElement;

    //Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; //Transparent

    //DEBUG: Grid helper
    //const gridHelper = new THREE.GridHelper(10, 10);
    //this.scene.add(gridHelper);

    //DEBUG: World axes
    //const worldAxes = new THREE.AxesHelper(5);
    //this.scene.add(worldAxes);

    //Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(0, 1, 5);
    this.camera.lookAt(0, 0, 0);

    //Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true, //Transparent background
      antialias: window.devicePixelRatio <= 1, //Only on low DPR
      powerPreference: 'high-performance', //GPU priority
    });

    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    //Pixel ratio cap (max 2)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    //Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    //Resize handler
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private setupPerformanceOptimization() {
    const canvas = this.canvasRef.nativeElement;

    //Detect low-end devices
    const gl = this.renderer.getContext();

    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

        //Integrated GPU detection (slower)
        if (renderer && renderer.toLowerCase().includes('intel')) {
          this.targetFPS = 24;
          this.frameInterval = 1000 / this.targetFPS;
          this.renderer.setPixelRatio(1);
        }
      }
    }

    //Intersection Observer - only render when visible
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) {
          //Not visible - stop animation
          if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = 0;
          }
        } else {
          //Visible - restart animation
          if (this.animationFrameId === 0) {
            this.animate();
          }
        }
      },
      { threshold: 0.1 },
    );

    this.intersectionObserver.observe(canvas);
  }

  private loadModel() {
    const loader = new GLTFLoader();

    const modelPath = this.getModelPathByTheme();

    loader.load(
      modelPath,
      (gltf) => {
        const loadedModel = gltf.scene;

        //Center the model (fix pivot point)
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        //console.log('Model size:', size);
        //console.log('Model center:', center);
        //console.log('Max dimension:', Math.max(size.x, size.y, size.z));

        //Move model so pivot is at center
        loadedModel.position.sub(center);

        //Auto scale the model
        const maxDimension = Math.max(size.x, size.y, size.z);
        const targetSize = 2;
        const autoScale = targetSize / maxDimension;

        //Theme-specific scale
        const themeScale = this.getScaleByTheme();
        const finalScale = autoScale * themeScale;

        loadedModel.scale.set(finalScale, finalScale, finalScale);

        //Create wrapper group (rotation happens around center)
        const group = new THREE.Group();
        group.add(loadedModel);
        this.scene.add(group);

        //Rotate the group, not the model itself
        this.model = group;

        this.isModelLoaded.set(true);
      },
      (progress) => {
        //Loading progress
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          this.loadingProgress.set(percent);
        }
      },
      (error) => {
        console.error('Model loading error:', error);
      },
    );
  }

  private getModelPathByTheme(): string {
    const theme = this.themeService.getCurrentTheme();

    switch (theme) {
      case 'christmas':
        return '/assets/models/christmas.glb';
      case 'halloween':
        return '/assets/models/halloween.glb';
      case 'neon':
        return '/assets/models/neon.glb';
      case 'cyberpunk':
        return '/assets/models/cyberpunk.glb';
      default:
        return '/assets/models/tv.glb';
    }
  }

  private getScaleByTheme(): number {
    const theme = this.themeService.getCurrentTheme();

    switch (theme) {
      case 'christmas':
        return 1.5; // ⬅️ 10% nagyobb
      case 'halloween':
        return 0.9; // ⬅️ 10% kisebb
      case 'neon':
        return 1.5;
      case 'cyberpunk':
        return 1.2; // ⬅️ 20% nagyobb
      default:
        return 1.0;
    }
  }

  private setupMouseEvents() {
    const canvas = this.canvasRef.nativeElement;

    //Mouse down
    canvas.addEventListener('mousedown', (event) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMouseX = event.clientX;
      canvas.style.cursor = 'grabbing';

      clearTimeout(this.autoRotateTimeout);
    });

    //Mouse move
    canvas.addEventListener('mousemove', (event) => {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.01;
      this.previousMouseX = event.clientX;
    });

    //Mouse up
    canvas.addEventListener('mouseup', () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';

      clearTimeout(this.autoRotateTimeout);
      this.autoRotateTimeout = setTimeout(() => {
        this.autoRotate = true;
        //Sync current and target rotation
        this.currentRotationY = this.targetRotationY;
      }, 1000);
    });

    //Mouse leave
    canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      canvas.style.cursor = 'grab';

      clearTimeout(this.autoRotateTimeout);
      this.autoRotateTimeout = setTimeout(() => {
        this.autoRotate = true;
        this.currentRotationY = this.targetRotationY;
      }, 1000);
    });

    //Initial cursor
    canvas.style.cursor = 'grab';

    //Touch events (mobile support)
    canvas.addEventListener('touchstart', (event) => {
      this.isDragging = true;
      this.autoRotate = false;
      this.previousMouseX = event.touches[0].clientX;

      clearTimeout(this.autoRotateTimeout);
    });

    canvas.addEventListener('touchmove', (event) => {
      if (!this.isDragging) return;
      event.preventDefault();

      const touch = event.touches[0];
      const deltaX = touch.clientX - this.previousMouseX;
      this.targetRotationY += deltaX * 0.01;
      this.previousMouseX = touch.clientX;
    });

    canvas.addEventListener('touchend', () => {
      this.isDragging = false;

      clearTimeout(this.autoRotateTimeout);
      this.autoRotateTimeout = setTimeout(() => {
        this.autoRotate = true;
        this.currentRotationY = this.targetRotationY;
      }, 1000);
    });
  }

  private animate(currentTime = 0) {
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));

    //FPS limiting
    const elapsed = currentTime - this.lastFrameTime;
    if (elapsed < this.frameInterval) {
      return; //Skip frame
    }

    this.lastFrameTime = currentTime - (elapsed % this.frameInterval);

    if (this.model) {
      if (this.autoRotate) {
        this.targetRotationY += 0.005;
      }

      //Smooth interpolation
      const lerpFactor = 0.1;
      this.currentRotationY +=
        (this.targetRotationY - this.currentRotationY) * lerpFactor;

      //Apply rotation - only Y axis
      this.model.rotation.x = 0; //Vertical
      this.model.rotation.y = this.currentRotationY; //Horizontal only
    }

    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize() {
    const canvas = this.canvasRef.nativeElement;

    this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
}
