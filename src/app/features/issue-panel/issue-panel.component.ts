import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
} from '@angular/core';
import { IssuePanelIntroComponent } from './issue-panel-intro/issue-panel-intro.component';
import { MatTab, MatTabContent, MatTabGroup, MatTabLabel } from '@angular/material/tabs';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { IssueProviderTabComponent } from './issue-provider-tab/issue-provider-tab.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectIssueProvidersWithDisabledLast } from '../issue/store/issue-provider.selectors';
import { IssueProvider } from '../issue/issue.model';
import {
  getIssueProviderInitials,
  getIssueProviderTooltip,
} from '../issue/mapping-helper/get-issue-provider-tooltip';
import { MatDialog } from '@angular/material/dialog';
import { T } from '../../t.const';
import { DialogEditIssueProviderComponent } from '../issue/dialog-edit-issue-provider/dialog-edit-issue-provider.component';
import { IssueProviderSetupOverviewComponent } from './issue-provider-setup-overview/issue-provider-setup-overview.component';
import { WorkContextService } from '../work-context/work-context.service';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { moveItemInArray } from '../../util/move-item-in-array';
import { IssueProviderActions } from '../issue/store/issue-provider.actions';
import { IssueIconPipe } from '../issue/issue-icon/issue-icon.pipe';

@Component({
  selector: 'issue-panel',
  imports: [
    IssuePanelIntroComponent,
    MatTabGroup,
    MatTab,
    MatTabLabel,
    MatIcon,
    MatTooltip,
    IssueProviderTabComponent,
    MatTabContent,
    IssueProviderSetupOverviewComponent,
    CdkDropList,
    CdkDrag,
    IssueIconPipe,
  ],
  templateUrl: './issue-panel.component.html',
  styleUrl: './issue-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssuePanelComponent {
  readonly T = T;

  private _store = inject(Store);
  private _matDialog = inject(MatDialog);
  private _workContextService = inject(WorkContextService);

  selectedTabIndex = signal(0);
  isShowIntro = signal(false);
  issueProviders = toSignal(this._store.select(selectIssueProvidersWithDisabledLast));

  issueProvidersMapped: Signal<
    {
      issueProvider: IssueProvider;
      initials?: string | null;
      tooltip: string;
    }[]
  > = computed(
    () =>
      this.issueProviders()?.map((p) => ({
        issueProvider: p,
        initials: getIssueProviderInitials(p),
        tooltip: getIssueProviderTooltip(p),
      })) || [],
  );

  constructor() {
    this._setSelectedTabIndex();
  }

  openEditIssueProvider(issueProvider: IssueProvider): void {
    this._matDialog.open(DialogEditIssueProviderComponent, {
      restoreFocus: true,
      data: {
        issueProvider,
      },
    });
  }

  drop(ev: CdkDragDrop<string[]>): void {
    const issueProviders = this.issueProviders();
    if (!issueProviders) {
      return;
    }

    const currentValue = this.issueProvidersMapped();
    const newItems = moveItemInArray(currentValue, ev.previousIndex, ev.currentIndex);
    this._store.dispatch(
      IssueProviderActions.sortIssueProvidersFirst({
        ids: newItems.map((p) => p.issueProvider.id),
      }),
    );
  }

  private _setSelectedTabIndex(): void {
    const providers = this.issueProviders();
    const index = providers?.findIndex(
      (provider) =>
        provider.defaultProjectId === this._workContextService.activeWorkContextId,
    );
    if (index) {
      this.selectedTabIndex.set(index !== -1 ? index : 0);
    }
  }
}
