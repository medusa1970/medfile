type MongoDocument = {
  _id?: unknown
  __v?: unknown
}

export function serializeDocument<T extends MongoDocument>(doc: T) {
  const { _id, __v, ...rest } = doc
  return {
    ...rest,
    id: String(_id),
  }
}

export function serializeDocuments<T extends MongoDocument>(docs: T[]) {
  return docs.map((doc) => serializeDocument(doc))
}
