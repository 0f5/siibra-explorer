import { CommonModule, DOCUMENT } from "@angular/common";
import { APP_INITIALIZER, NgModule } from "@angular/core";
import { AngularMaterialModule } from 'src/sharedModules/angularMaterial.module'
import { ViveSignal } from "./viveSignal/viveSignal.component";
import { ViveService } from "./service";
import { ViveControlViewRef } from "./signal.directive";

@NgModule({
  imports: [
    CommonModule,
    AngularMaterialModule,
  ],
  declarations: [
    ViveSignal,
    ViveControlViewRef
  ],
  exports: [
    ViveSignal,
    ViveControlViewRef
  ],
  providers: [
    ViveService,
    {
      provide: APP_INITIALIZER,
      useFactory(document: Document){
        const scel = document.createElement("script")
        scel.src = "leap-0.6.4.js"
        document.head.appendChild(scel)
        return () => Promise.resolve()
      },
      deps: [
        DOCUMENT
      ],
      multi: true
    },
  ],
})
export class HTCViveModule{}