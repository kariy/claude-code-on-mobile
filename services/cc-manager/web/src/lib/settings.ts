const SSH_DESTINATION_KEY = "cc-manager:ssh-destination";

export function getSshDestination(): string | null {
  return localStorage.getItem(SSH_DESTINATION_KEY);
}

export function setSshDestination(value: string): void {
  localStorage.setItem(SSH_DESTINATION_KEY, value);
}
