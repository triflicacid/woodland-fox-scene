/**
 * manages persistence of scene preferences across sessions via localStorage.
 * components and scene state register providers which define how to save and restore their values.
 */
export class SaveState {
  /** @type{Map<string, {key: string, save: () => any, load: (v: any) => void, defaultValue?: any}>} */
  providers = new Map();

  /**
   * registers a value provider.
   * `save()` should return the value to persist, `load()` receives the restored value.
   * @param {{key: string, save: () => any, load: (v: any) => void, defaultValue?: any}} provider
   * @returns {SaveState} reference to `this`
   */
  register(provider) {
    if (this.providers.has(provider.key)) {
      console.error(`Provider ${provider.key} is already registered`);
    } else {
      this.providers.set(provider.key, provider);
    }
    return this;
  }

  /**
   * saves the given providers to localStorage.
   * if no values are given, saves ALL providers.
   * @param {string} providerKeys providers names
   */
  save(...providerKeys) {
    this._getProviders(providerKeys).forEach(({key, save}) => {
      const val = save();
      if (val !== undefined) localStorage.setItem(key, JSON.stringify(val));
    });
  }

  /**
   * restores the given providers from localStorage.
   * if no values are given, restores ALL providers.
   * @param {string} providerKeys
   */
  load(...providerKeys) {
    this._getProviders(providerKeys).forEach(({key, load, defaultValue}) => {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null && defaultValue !== null) {
          load(defaultValue);
        } else if (raw !== null) {
          load(JSON.parse(raw));
        } else {
          load(defaultValue ?? null);
        }
      } catch (e) {
        load(defaultValue ?? null);
      }
    });
  }

  /**
   * return all providers which match the given key set.
   * @param {string[]} keys
   * @returns {object[]}
   */
  _getProviders(keys) {
    keys.forEach(key => {
      if (!this.providers.has(key)) {
        console.warn(`No provider found with key "${key}"`);
      }
    });

    const providers = [...this.providers.values()];
    return keys.length === 0 ? providers : providers.filter(p => keys.indexOf(p.key) !== -1);
  }
}