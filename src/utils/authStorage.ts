// Custom storage adapter that switches between localStorage and sessionStorage
class AuthStorage {
  private useRememberMe: boolean = false;

  setRememberMe(remember: boolean) {
    this.useRememberMe = remember;
    // Store preference in sessionStorage so it persists during the session
    sessionStorage.setItem('auth-remember-me', remember.toString());
  }

  getRememberMe(): boolean {
    const stored = sessionStorage.getItem('auth-remember-me');
    return stored === 'true';
  }

  private getStorage() {
    return this.useRememberMe || this.getRememberMe() ? localStorage : sessionStorage;
  }

  getItem(key: string): string | null {
    // Check both storages for existing tokens
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    this.getStorage().setItem(key, value);
  }

  removeItem(key: string): void {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }
}

export const authStorage = new AuthStorage();
