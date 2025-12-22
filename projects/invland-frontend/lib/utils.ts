import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1000000000) {
    return `${(price / 1000000000).toFixed(1)} tỷ`
  }
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(0)} triệu`
  }
  return price.toLocaleString('vi-VN')
}

export function formatArea(area: number): string {
  return `${area.toLocaleString('vi-VN')} m²`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

export function getPriceRange(min: number, max: number): string {
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

export function getAreaRange(min: number, max: number): string {
  return `${formatArea(min)} - ${formatArea(max)}`
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export function validatePhone(phone: string): boolean {
  const re = /^(0|\+84)[0-9]{9,10}$/
  return re.test(phone.replace(/\s/g, ''))
}
