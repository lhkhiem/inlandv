// Shared constants

export const API_ENDPOINTS = {
  PUBLIC_BACKEND: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  CMS_BACKEND: process.env.NEXT_PUBLIC_CMS_API_URL || 'http://localhost:4001/api',
} as const

export const PROJECT_STATUS = {
  DANG_MO_BAN: 'dang-mo-ban',
  SAP_MO_BAN: 'sap-mo-ban',
  DA_BAN: 'da-ban',
} as const

export const LISTING_TYPES = {
  CAN_HO: 'can-ho',
  NHA_PHO: 'nha-pho',
  DAT_NEN: 'dat-nen',
  BIET_THU: 'biet-thu',
  SHOPHOUSE: 'shophouse',
} as const

export const LEAD_SOURCES = {
  HOMEPAGE: 'homepage',
  PROJECT: 'project',
  CONTACT: 'contact',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  SALE: 'sale',
} as const

