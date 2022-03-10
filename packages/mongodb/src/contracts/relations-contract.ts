'use strict'

import { MongodbModel } from './model-contract'

export interface HasRelations {
  hasOne<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  hasMany<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  belongsTo<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
}

export interface RelationMappings {
  [relationName: string]: RelationContract | RelationBuilderContract
}

export interface RelationBuilderContract {
  from(collection: string): this
  localField(field: string): this
  remoteField(field: string): this
  resolve(): RelationContract
}

export interface RelationContract {
  collection: string
  localField?: string
  foreignField: string
  ownerModelClass: MongodbModel
  remoteModelClass: MongodbModel
}
