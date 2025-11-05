import { format as dateFnsFormat } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export const formatDate = (date: Date | string, formatStr: string = 'PPP') => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateFnsFormat(dateObj, formatStr, { locale: ar })
}

export const formatCurrency = (amount: number, currency: string = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
  }).format(amount)
}

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ar-SA').format(num)
}

export const formatPhoneNumber = (phone: string) => {
  // تنسيق رقم الهاتف السعودي
  return phone.replace(/(\+966|0)?(\d{2})(\d{3})(\d{4})/, '+966 $2 $3 $4')
}








