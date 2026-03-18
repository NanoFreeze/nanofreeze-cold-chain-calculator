type CookieValue = string | number | boolean | object | null | undefined

interface CookieOptions {
  expires?: number | Date
  path?: string
  secure?: boolean
  sameSite?: "Strict" | "Lax" | "None"
}

const isBrowser = typeof document !== "undefined"

const normalizeExpires = (expires?: number | Date) => {
  if (!expires) return undefined
  if (expires instanceof Date) return expires
  const date = new Date()
  date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000)
  return date
}

const serializeValue = (value: CookieValue) => {
  if (value === undefined) return ""
  if (typeof value === "string") return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

const deserializeValue = (value: string) => {
  const trimmed = value?.trim()
  if (!trimmed) return undefined
  try {
    return JSON.parse(trimmed)
  } catch {
    return trimmed
  }
}

export const useCookies = () => {
  const createCookie = (name: string, value: CookieValue, options: CookieOptions = {}) => {
    if (!isBrowser) return
    const parts: string[] = []
    parts.push(`${encodeURIComponent(name)}=${encodeURIComponent(serializeValue(value))}`)

    const expires = normalizeExpires(options.expires)
    if (expires) parts.push(`Expires=${expires.toUTCString()}`)

    parts.push(`Path=${options.path ?? "/"}`)

    if (options.secure) parts.push("Secure")
    if (options.sameSite) parts.push(`SameSite=${options.sameSite}`)

    document.cookie = parts.join("; ")
  }

  const readCookie = <T = unknown>(name: string): T | undefined => {
    if (!isBrowser) return undefined
    const cookies = document.cookie ? document.cookie.split("; ") : []

    for (const cookie of cookies) {
      const [rawName, ...rest] = cookie.split("=")
      if (decodeURIComponent(rawName) === name) {
        const rawValue = rest.join("=")
        return deserializeValue(decodeURIComponent(rawValue)) as T
      }
    }

    return undefined
  }

  const deleteCookie = (name: string) => {
    if (!isBrowser) return
    document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`
  }

  return {
    createCookie,
    readCookie,
    deleteCookie,
  }
}

export default useCookies

