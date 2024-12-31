/* eslint-disable max-len */
import { ConfigFormSection } from '../global-config.model';
import {
  SimpleCounterConfig,
  SimpleCounterType,
} from '../../simple-counter/simple-counter.model';
import { T } from '../../../t.const';
import { EMPTY_SIMPLE_COUNTER } from '../../simple-counter/simple-counter.const';
import { nanoid } from 'nanoid';

export const SIMPLE_COUNTER_FORM: ConfigFormSection<SimpleCounterConfig> = {
  title: T.F.SIMPLE_COUNTER.FORM.TITLE,
  key: 'EMPTY',
  customSection: 'SIMPLE_COUNTER_CFG',
  help: T.F.SIMPLE_COUNTER.FORM.HELP,
  items: [
    {
      key: 'counters',
      type: 'repeat',
      templateOptions: {
        addText: T.F.SIMPLE_COUNTER.FORM.ADD_NEW,
        getInitialValue: () => ({
          ...EMPTY_SIMPLE_COUNTER,
          id: nanoid(),
          isEnabled: true,
        }),
      },
      fieldArray: {
        fieldGroup: [
          {
            type: 'checkbox',
            key: 'isEnabled',
            templateOptions: {
              label: T.F.SIMPLE_COUNTER.FORM.L_IS_ENABLED,
            },
          },
          {
            type: 'input',
            key: 'title',
            templateOptions: {
              label: T.F.SIMPLE_COUNTER.FORM.L_TITLE,
            },
          },
          {
            key: 'type',
            type: 'select',
            templateOptions: {
              label: T.F.SIMPLE_COUNTER.FORM.L_TYPE,
              required: true,
              options: [
                {
                  label: T.F.SIMPLE_COUNTER.FORM.TYPE_STOPWATCH,
                  value: SimpleCounterType.StopWatch,
                },
                {
                  label: T.F.SIMPLE_COUNTER.FORM.TYPE_CLICK_COUNTER,
                  value: SimpleCounterType.ClickCounter,
                },
                {
                  label: T.F.SIMPLE_COUNTER.FORM.TYPE_REPEATED_COUNTDOWN,
                  value: SimpleCounterType.RepeatedCountdownReminder,
                },
              ],
            },
          },
          {
            type: 'icon',
            key: 'icon',
            templateOptions: {
              label: T.F.SIMPLE_COUNTER.FORM.L_ICON,
            },
          },
          {
            type: 'icon',
            key: 'iconOn',
            hideExpression: (model: any) => {
              return model.type !== SimpleCounterType.StopWatch;
            },
            templateOptions: {
              label: T.F.SIMPLE_COUNTER.FORM.L_ICON_ON,
            },
          },
          {
            key: 'countdownDuration',
            type: 'duration',
            hideExpression: (model: any) => {
              return model.type !== SimpleCounterType.RepeatedCountdownReminder;
            },
            hooks: {
              onInit: (field) => {
                console.log(field?.formControl?.value);
                if (!field?.formControl?.value && field?.formControl?.value !== null) {
                  field?.formControl?.setValue(30 * 60000);
                }
              },
            },
            templateOptions: {
              required: false,
              isAllowSeconds: false,
              label: T.F.SIMPLE_COUNTER.FORM.L_COUNTDOWN_DURATION,
              description: T.G.DURATION_DESCRIPTION,
            },
          },
          // TODO maybe migrate to new auto simple counter type later
          // {
          //   key: 'triggerOnActions',
          //   type: 'select',
          //   hideExpression: (model: any) => {
          //     return model.type !== SimpleCounterType.ClickCounter;
          //   },
          //   templateOptions: {
          //     label: T.F.SIMPLE_COUNTER.FORM.L_AUTO_COUNT_UP,
          //     multiple: true,
          //     options: SIMPLE_COUNTER_TRIGGER_ACTIONS.map((actionStr) => ({
          //       label: actionStr,
          //       value: actionStr,
          //     })),
          //   },
          // },
          // {
          //   key: 'triggerOnActions',
          //   type: 'select',
          //   hideExpression: (model: any) => {
          //     return model.type !== SimpleCounterType.StopWatch;
          //   },
          //   templateOptions: {
          //     label: T.F.SIMPLE_COUNTER.FORM.L_AUTO_SWITCH_ON,
          //     multiple: true,
          //     options: SIMPLE_COUNTER_TRIGGER_ACTIONS.map((actionStr) => ({
          //       label: actionStr,
          //       value: actionStr,
          //     })),
          //   },
          // },
          // {
          //   key: 'triggerOffActions',
          //   type: 'select',
          //   hideExpression: (model: any) => {
          //     return model.type !== SimpleCounterType.StopWatch;
          //   },
          //   templateOptions: {
          //     label: T.F.SIMPLE_COUNTER.FORM.L_AUTO_SWITCH_OFF,
          //     multiple: true,
          //     options: SIMPLE_COUNTER_TRIGGER_ACTIONS.map((actionStr) => ({
          //       label: actionStr,
          //       value: actionStr,
          //     })),
          //   },
          // },
        ],
      },
    },
  ],
};
