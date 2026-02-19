export function getOrCreateClientId(): string{
  const existing = localStorage.getItem("clientId")
  if (existing)
    return existing
  
  const newClientId = crypto.randomUUID()
  localStorage.setItem("clientId", newClientId)
  return newClientId
}