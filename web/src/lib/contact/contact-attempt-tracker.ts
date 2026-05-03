import type {ContactAttemptOutcome} from './intake';

export type ContactAttemptTrackerState = {
  submissionAttempt: number;
  trackedAttempt: number;
};

export type ContactAttemptCompletion =
  | {
      shouldTrack: true;
      submitAttempt: number;
      outcome: Exclude<ContactAttemptOutcome, {kind: 'spam'}>;
    }
  | {
      shouldTrack: false;
      submitAttempt: number;
      outcome: Extract<ContactAttemptOutcome, {kind: 'spam'}>;
    };

export function createContactAttemptTrackerState(): ContactAttemptTrackerState {
  return {
    submissionAttempt: 0,
    trackedAttempt: 0,
  };
}

export function captureContactSubmitAttempt(state: ContactAttemptTrackerState) {
  state.submissionAttempt += 1;
  return state.submissionAttempt;
}

export function resolveContactAttemptCompletion({
  state,
  pending,
  outcome,
}: {
  state: ContactAttemptTrackerState;
  pending: boolean;
  outcome?: ContactAttemptOutcome;
}): ContactAttemptCompletion | null {
  if (pending || !outcome) return null;

  const submitAttempt = state.submissionAttempt;
  if (submitAttempt === 0 || submitAttempt <= state.trackedAttempt) return null;

  state.trackedAttempt = submitAttempt;

  if (outcome.kind === 'spam') {
    return {shouldTrack: false, submitAttempt, outcome};
  }

  return {shouldTrack: true, submitAttempt, outcome};
}
