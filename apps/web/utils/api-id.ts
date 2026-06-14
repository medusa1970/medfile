export function resolveApiId(entity: { id?: string; _id?: string } | null | undefined) {
  return entity?.id || entity?._id || ''
}
