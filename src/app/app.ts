import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [':host { display: block; height: 100vh; overflow: hidden; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
