'use strict'

import { MongodbModel } from './model-contract'

export interface HasRelations {
  hasOne<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  hasMany<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  belongsTo<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
}

export interface RelationMappings {
  [relationName: string]: RelationBuilderContract | RelationBuilderResult
}

export interface RelationBuilderContract {
  localField(field: string): this
  foreignField(field: string): this
  resolve(): RelationBuilderResult
}

export interface RelationBuilderResult {
  justOne: boolean
  collection: string
  localField: string
  foreignField: string
  ownerModelClass: MongodbModel
  remoteModelClass: MongodbModel
}
