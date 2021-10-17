import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { TimelineFromCalendarEvent, TimelineViewEntry } from './timeline.model';
import { catchError, debounceTime, map, switchMap, tap } from 'rxjs/operators';
import { TaskService } from '../tasks/task.service';
import { combineLatest, Observable, of } from 'rxjs';
import { mapToTimelineViewEntries } from './map-timeline-data/map-to-timeline-view-entries';
import { T } from 'src/app/t.const';
import { standardListAnimation } from '../../ui/animations/standard-list.ani';
import { getTomorrow } from '../../util/get-tomorrow';
import { TimelineViewEntryType } from './timeline.const';
import { GlobalConfigService } from '../config/global-config.service';
import { MatDialog } from '@angular/material/dialog';
import { LS_WAS_TIMELINE_INITIAL_DIALOG_SHOWN } from '../../core/persistence/ls-keys.const';
import { DialogTimelineInitialSetupComponent } from './dialog-timeline-initial-setup/dialog-timeline-initial-setup.component';
import { WorkContextService } from '../work-context/work-context.service';
import { TaskRepeatCfgService } from '../task-repeat-cfg/task-repeat-cfg.service';
import { Task } from '../tasks/task.model';
import { DialogAddTaskReminderComponent } from '../tasks/dialog-add-task-reminder/dialog-add-task-reminder.component';
import { AddTaskReminderInterface } from '../tasks/dialog-add-task-reminder/add-task-reminder-interface';
import { HttpClient } from '@angular/common/http';
import { getRelevantEventsFromIcal } from './ical/get-relevant-events-from-ical';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [standardListAnimation],
})
export class TimelineComponent implements OnDestroy {
  T: typeof T = T;
  TimelineViewEntryType: typeof TimelineViewEntryType = TimelineViewEntryType;
  icalEvents$: Observable<TimelineFromCalendarEvent[]> =
    this._globalConfigService.timelineCfg$.pipe(
      switchMap((cfg) => {
        return cfg.icalUrl && cfg.icalUrl.length > 3
          ? this._http.get(cfg.icalUrl, { responseType: 'text' }).pipe(
              map(getRelevantEventsFromIcal),
              catchError((err) => {
                // TODO snack
                console.error(err);
                return of([]);
              }),
            )
          : of([]);
      }),
    );
  timelineEntries$: Observable<TimelineViewEntry[]> = combineLatest([
    this._workContextService.timelineTasks$,
    this._taskRepeatCfgService.taskRepeatCfgsWithStartTime$,
    this.taskService.currentTaskId$,
    this._globalConfigService.timelineCfg$,
  ]).pipe(
    debounceTime(50),
    map(([{ planned, unPlanned }, taskRepeatCfgs, currentId, timelineCfg]) =>
      mapToTimelineViewEntries(
        unPlanned,
        planned,
        taskRepeatCfgs,
        currentId,
        timelineCfg?.isWorkStartEndEnabled
          ? {
              startTime: timelineCfg.workStart,
              endTime: timelineCfg.workEnd,
            }
          : undefined,
      ),
    ),

    // NOTE: this doesn't require cd.detect changes because view is already re-checked with obs
    tap(() => (this.now = Date.now())),
  );
  now: number = Date.now();
  tomorrow: number = getTomorrow(0).getTime();

  private _moveUpTimeout?: number;
  private _moveDownTimeout?: number;

  constructor(
    public taskService: TaskService,
    private _taskRepeatCfgService: TaskRepeatCfgService,
    private _workContextService: WorkContextService,
    private _globalConfigService: GlobalConfigService,
    private _matDialog: MatDialog,
    private _http: HttpClient,
  ) {
    this.icalEvents$.subscribe((v) => console.log(`icalEvents$`, v));

    if (!localStorage.getItem(LS_WAS_TIMELINE_INITIAL_DIALOG_SHOWN)) {
      this._matDialog.open(DialogTimelineInitialSetupComponent);
    }
  }

  ngOnDestroy(): void {
    window.clearTimeout(this._moveUpTimeout);
    window.clearTimeout(this._moveDownTimeout);
  }

  trackByFn(i: number, item: any): string {
    return item.id;
  }

  async moveUp(task: Task): Promise<void> {
    if (task.parentId) {
      const parentTask = await this.taskService.getByIdOnce$(task.parentId).toPromise();
      if (parentTask.subTaskIds[0] === task.id) {
        this.taskService.moveUp(task.parentId, undefined, false);
        window.clearTimeout(this._moveUpTimeout);
        window.setTimeout(() => this.taskService.focusTask(task.id), 50);
        return;
      }
    }
    this.taskService.moveUp(task.id, task.parentId, false);
    window.clearTimeout(this._moveUpTimeout);
    window.setTimeout(() => this.taskService.focusTask(task.id), 50);
  }

  async moveDown(task: Task): Promise<void> {
    if (task.parentId) {
      const parentTask = await this.taskService.getByIdOnce$(task.parentId).toPromise();
      if (parentTask.subTaskIds[parentTask.subTaskIds.length - 1] === task.id) {
        this.taskService.moveDown(task.parentId, undefined, false);
        window.clearTimeout(this._moveDownTimeout);
        window.setTimeout(() => this.taskService.focusTask(task.id), 50);
        return;
      }
    }

    this.taskService.moveDown(task.id, task.parentId, false);
    window.clearTimeout(this._moveDownTimeout);
    window.setTimeout(() => this.taskService.focusTask(task.id), 50);
  }

  editTaskReminder(task: Task): void {
    // NOTE: this also might schedule an unscheduled sub task of a scheduled parent
    this._matDialog.open(DialogAddTaskReminderComponent, {
      data: { task } as AddTaskReminderInterface,
    });
  }
}
