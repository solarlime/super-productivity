import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { T } from '../../t.const';
import { Subscription } from 'rxjs';
import { ESCAPE } from '@angular/cdk/keycodes';
import { LS } from '../../core/persistence/storage-keys.const';
import { isSmallScreen } from '../../util/is-small-screen';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

type ViewMode = 'SPLIT' | 'PARSED' | 'TEXT_ONLY';
const ALL_VIEW_MODES: ['SPLIT', 'PARSED', 'TEXT_ONLY'] = ['SPLIT', 'PARSED', 'TEXT_ONLY'];

@Component({
  selector: 'dialog-fullscreen-markdown',
  templateUrl: './dialog-fullscreen-markdown.component.html',
  styleUrls: ['./dialog-fullscreen-markdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MarkdownComponent,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatTooltip,
    MatIcon,
    MatButton,
    TranslatePipe,
  ],
})
export class DialogFullscreenMarkdownComponent implements OnDestroy {
  _matDialogRef = inject<MatDialogRef<DialogFullscreenMarkdownComponent>>(MatDialogRef);
  data = inject(MAT_DIALOG_DATA);

  T: typeof T = T;
  viewMode: ViewMode = isSmallScreen() ? 'TEXT_ONLY' : 'SPLIT';

  private _subs: Subscription = new Subscription();

  constructor() {
    const _matDialogRef = this._matDialogRef;
    const data = this.data;

    const lastViewMode = localStorage.getItem(LS.LAST_FULLSCREEN_EDIT_VIEW_MODE);
    if (
      ALL_VIEW_MODES.includes(lastViewMode as ViewMode) &&
      // empty notes should never be in preview mode
      data.content.trim().length > 0
    ) {
      this.viewMode = lastViewMode as ViewMode;

      if (this.viewMode === 'SPLIT' && isSmallScreen()) {
        this.viewMode = 'TEXT_ONLY';
      }
    }

    // we want to save as default
    _matDialogRef.disableClose = true;
    this._subs.add(
      _matDialogRef.keydownEvents().subscribe((e) => {
        if ((e as any).keyCode === ESCAPE) {
          e.preventDefault();
          this.close();
        }
      }),
    );
  }

  keydownHandler(ev: KeyboardEvent): void {
    if (ev.key === 'Enter' && ev.ctrlKey) {
      this.close();
    }
  }

  ngModelChange(data: string): void {}

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  close(isSkipSave: boolean = false): void {
    this._matDialogRef.close(isSkipSave || this.data.content);
  }

  onViewModeChange(): void {
    localStorage.setItem(LS.LAST_FULLSCREEN_EDIT_VIEW_MODE, this.viewMode);
  }
}
