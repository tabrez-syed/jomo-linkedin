type ObserveTargetDocument = Pick<Document, 'body' | 'documentElement'>;

export function getObserveTarget(doc: ObserveTargetDocument): Node {
  return doc.body || doc.documentElement;
}
