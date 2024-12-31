// export function isTouch(): boolean {
//   try {
//     document.createEvent('TouchEvent');
//     return true;
//   } catch (e) {
//     return false;
//   }
// }
// export const IS_TOUCH = isTouch();
import { primaryInput } from 'detect-it';
import { IS_TOUCH_ONLY } from './is-touch-only';
import { environment } from '../../environments/environment';

// @see https://css-tricks.com/interaction-media-features-and-their-potential-for-incorrect-assumptions/

export const IS_MOUSE_PRIMARY = primaryInput === 'mouse';
export const IS_TOUCH_PRIMARY = IS_TOUCH_ONLY || primaryInput === 'touch';

if (environment.production) {
  console.log({ IS_MOUSE_PRIMARY, IS_TOUCH_PRIMARY });
}
