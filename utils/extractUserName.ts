export const appName = 'frame';

export function usernameFromEmail(email: string) {
return email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
}