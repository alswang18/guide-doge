import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { VRAccessibilityComponent } from './vr-accessibility.component';



@NgModule({
  declarations: [
    VRAccessibilityComponent,
  ],
  imports: [
  ],
  exports: [
    VRAccessibilityComponent,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class VRAccessibilityModule {
}
