export type PauseGateCopy = {
  title: string;
  durationLabel: (formattedDuration: string) => string;
  pageLabel: (pageCount: number) => string;
  continueLabel: string;
  doneLabel: string;
};

export const PAUSE_GATE_COPY: PauseGateCopy = {
  title: 'Keep going?',
  durationLabel: (formattedDuration: string) =>
    `You've been on LinkedIn for ${formattedDuration}.`,
  pageLabel: (pageCount: number) => `Page ${pageCount}`,
  continueLabel: 'Keep going',
  doneLabel: 'Done for now'
};
