import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, Optional } from "@angular/core";
import { BehaviorSubject, EMPTY, interval, noop, Observable, Subject } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { NehubaViewerUnit } from "../nehuba";
import { NEHUBA_INSTANCE_INJTKN } from "../nehuba/util";


const PINCH_THRESHOLD = 0.80
const PALM_Z_THRESHOLD = 0.55
const ROTATION_SPEED = 0.0001
const ZOOM_SPEED = 40

type Finger = {
  extended: boolean
}

type Hand = {
  pinchStrength: number
  palmNormal: [number, number, number]
  palmVelocity: [number, number, number]

  thumb: Finger
  indexFinger: Finger
  middleFinger: Finger
  ringFinger: Finger
  pinky: Finger
}


@Injectable()
export class ViveService{

  public ready$ = new BehaviorSubject(false)

  public currentpos$ = new Subject<string>()
  public currentquad$ = new Subject<string>()
  public connected$ = new BehaviorSubject<string>("not connected")

  private vec3: any
  private quat: any
  
  private quat_offset = [0.0, -0.0, 0.0, 1.0]
  private reconnectTimer: any = null;
  private nehubaInst2: Observable<NehubaViewerUnit>

  constructor(
    @Optional() @Inject(NEHUBA_INSTANCE_INJTKN) private nehubaInst$: Observable<NehubaViewerUnit>,
    @Inject(DOCUMENT) document: Document,
  ){
    
    
    interval(160).pipe(
      filter(() => !!(window as any).export_nehuba),
      take(1)
    ).subscribe(() => {
      this.vec3 = (window as any).export_nehuba.vec3
      this.quat = (window as any).export_nehuba.quat
    })


    console.log("ViveService: starting HTC Vive Tracker Service");
    this.connectWebSocket();
    this.ready$.next(true);
    this.nehubaInst2 = nehubaInst$
  }

  private connectWebSocket(): void {
    try {
      console.log("ViveService: attemting to connect to websocket ws://localhost:8765");
      const ws = new WebSocket("ws://127.0.0.1:8765");

      ws.onopen = () => this.connected$.next("connected");
      
      ws.onerror = () => {
        this.connected$.next("disconnected (websocket error)");
        this.scheduleReconnect();
      };

      ws.onclose = () => {
        this.connected$.next("disconnected (websocket closed)");
        this.scheduleReconnect();
      };

      ws.onmessage = (event) => this.handleFrame(JSON.parse(event.data));
    } catch (error) {
      console.warn("ViveService: websocket connection failed", error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    
    if (this.reconnectTimer) return; // already scheduled
    console.log("ViveService: attemting reconnect in 3000");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connectWebSocket();
    }, 3000);
  }


  handleFrame(data: any){
    if (!data || typeof data !== "object") return;
    const pose = {
      position: data.position || { x: 0, y: 0, z: 0 },
      rotation: data.rotation || { x: 0, y: 0, z: 0, w: 1 },
    };

    this.setpose(pose);
  }

  private setpose (pose : any){
    const position = pose.position || {};
    const rotation = pose.rotation || {};

    this.nehubaInst2
      .pipe(
        filter((inst): inst is NonNullable<typeof inst> => !!inst?.nehubaViewer?.ngviewer)
      )
      .pipe(take(1))
      .subscribe(inst => {
        const pose = inst.nehubaViewer.ngviewer.navigationState.pose;
        var orient = inst.nehubaViewer.ngviewer.perspectiveNavigationState.pose.orientation

        //console.log(this.vec3, Array.isArray(this.vec3))
        //pose.position.coordinates = this.vec3;
        //console.log(this.quat, Array.isArray(this.vec3))
        //pose.orientation = this.quat;

        /* 
        xyzw  - no
        xywz  - no
        xzyw  - no 
        xzwy  - no
        xwyz  - no
        xwzy  - no

        Start with y:

        yxzw - no
        yxwz - no
        yzxw  - no
        yzwx  - no
        ywxz  - no
        ywzx  - no

        Start with z:

        zxyw
        zxwy
        zyxw
        zywx
        zwxy
        zwyx

        Start with w:

        wxyz  - yes.
        wxyz  - no
        wxzy  - no
        wyxz  - no
        wyzx  - no
        wzxy  - no
        wzyx   - maybe
        */

        var newquat = this.quat.fromValues(
          rotation.w ?? 0,
          rotation.x ?? 0,
          rotation.y ?? 1,
          rotation.z ?? 0,
        );
        var newpos = [
          position.x ?? 0,
          position.y ?? 0,
          position.z ?? 0,
        ];
        

        var offset_quat = this.quat.fromValues(
          this.quat_offset[0],
          this.quat_offset[1],
          this.quat_offset[2],
          this.quat_offset[3]
        );

        const rot = this.quat.create();
        this.quat.setAxisAngle(rot, [0, 1, 0], Math.PI / 2);

        //this.quat.multiply(offset_quat, offset_quat, rot)

        this.quat.copy(orient.orientation, newquat)
        this.quat.multiply(orient.orientation, orient.orientation, offset_quat)

        this.quat.multiply(orient.orientation, rot, orient.orientation )



        pose.changed.dispatch();
        orient.changed.dispatch();


        const formatNumber = (value: number) => value.toFixed(3);
        const vec3Formatted = newpos.map(formatNumber);
        const quatFormatted = newquat.map(formatNumber);

        this.currentpos$.next(`pos:${vec3Formatted.join(",")}`);
        this.currentquad$.next(`rot:${quatFormatted.join(",")}`);
      });

  }
}
