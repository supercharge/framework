'use strict'

import { ObjectId } from 'mongodb'

export interface ModelObject {
  [key: string]: any
}

export interface HasId {
  _id: ObjectId | string | number
}

export interface Timestamps {
  createdAt: Date
  updatedAt: Date
}
