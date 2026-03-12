import { NgModule } from "@angular/core";
import { CUSTOM_SYNC_COORDINATE_SPACE } from "./const"
import { BigBrainSliceCS } from "./bigbrain"
import { CustomCoordinateSpaceView } from "./view/ccs.component";
import { CommonModule } from "@angular/common";
import { AngularMaterialModule } from "src/sharedModules";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    CustomCoordinateSpaceView,
  ],
  declarations: [
    CustomCoordinateSpaceView,
  ],
  providers: [
    {
      provide: CUSTOM_SYNC_COORDINATE_SPACE,
      multi: true,
      useClass: BigBrainSliceCS
    }
  ]
})

export class CustomCoordinateSpaceModule{}
