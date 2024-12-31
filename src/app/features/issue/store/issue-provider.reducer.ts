import { createFeature, createReducer, on } from '@ngrx/store';
import { IssueProvider, IssueProviderState } from '../issue.model';
import { IssueProviderActions } from './issue-provider.actions';
import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { MODEL_VERSION_KEY } from '../../../app.constants';
import { loadAllData } from '../../../root-store/meta/load-all-data.action';
import { migrateIssueProviderState } from '../migrate-issue-providers';

export const ISSUE_PROVIDER_FEATURE_KEY = 'issueProvider';

export const adapter: EntityAdapter<IssueProvider> = createEntityAdapter<IssueProvider>();

export const issueProviderInitialState: IssueProviderState = adapter.getInitialState({
  ids: [] as string[],
  [MODEL_VERSION_KEY]: 0,
  // additional entity state properties
});

export const issueProviderReducer = createReducer(
  issueProviderInitialState,

  // META ACTIONS
  // ------------
  on(loadAllData, (oldState, { appDataComplete }) =>
    appDataComplete.issueProvider
      ? migrateIssueProviderState({ ...appDataComplete.issueProvider })
      : oldState,
  ),

  on(IssueProviderActions.addIssueProvider, (state, action) =>
    adapter.addOne(action.issueProvider, state),
  ),
  on(IssueProviderActions.upsertIssueProvider, (state, action) =>
    adapter.upsertOne(action.issueProvider, state),
  ),
  on(IssueProviderActions.addIssueProviders, (state, action) =>
    adapter.addMany(action.issueProviders, state),
  ),
  on(IssueProviderActions.upsertIssueProviders, (state, action) =>
    adapter.upsertMany(action.issueProviders, state),
  ),
  on(IssueProviderActions.updateIssueProvider, (state, action) =>
    adapter.updateOne(action.issueProvider, state),
  ),
  on(IssueProviderActions.updateIssueProviders, (state, action) =>
    adapter.updateMany(action.issueProviders, state),
  ),
  on(IssueProviderActions.deleteIssueProvider, (state, action) =>
    adapter.removeOne(action.id, state),
  ),
  on(IssueProviderActions.deleteIssueProviders, (state, action) =>
    adapter.removeMany(action.ids, state),
  ),
  on(IssueProviderActions.loadIssueProviders, (state, action) =>
    adapter.setAll(action.issueProviders, state),
  ),

  on(IssueProviderActions.sortIssueProvidersFirst, (state, action) => ({
    ...state,
    ids: [...action.ids, ...state.ids.filter((id) => !action.ids.includes(id))],
  })),

  on(IssueProviderActions.clearIssueProviders, (state) => adapter.removeAll(state)),
);

export const issueProvidersFeature = createFeature({
  name: ISSUE_PROVIDER_FEATURE_KEY,
  reducer: issueProviderReducer,
  extraSelectors: ({ selectIssueProviderState }) => ({
    ...adapter.getSelectors(selectIssueProviderState),
  }),
});
