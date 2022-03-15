'use strict'

import { MongodbModel } from './model-contract'

export interface HasRelations {
  hasOne<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  hasMany<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
  belongsTo<T extends MongodbModel>(ModelClass: T): RelationBuilderContract
}

export interface RelationMappings {
  [relationName: string]: RelationBuilderContract | Relation
}

export interface RelationBuilderContract {
  localField(field: string): this
  foreignField(field: string): this
  resolve(): Relation
}

export interface Relation {
  justOne: boolean
  collection: string
  localField: string
  foreignField: string
  ownerModelClass: MongodbModel
  foreignModelClass: MongodbModel
}
