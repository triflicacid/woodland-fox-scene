interface Provider<T> {
    key: string;
    save: () => T;
    load: (v: T) => void;
    defaultValue?: T;
}

/**
 * manages persistence of scene preferences across sessions via localStorage.
 * components and scene state register providers which define how to save and restore their values.
 */
export class SaveState {
    private readonly providers = new Map<string, Provider<unknown>>();

    /**
     * registers a value provider.
     * `save()` should return the value to persist, `load()` receives the restored value.
     */
    public register<T>(provider: Provider<T>): this {
        if (this.providers.has(provider.key)) {
            console.error(`provider ${provider.key} is already registered`);
        } else {
            this.providers.set(provider.key, provider as Provider<unknown>);
        }
        return this;
    }

    /**
     * saves the given providers to localStorage.
     * if no values are given, saves ALL providers.
     */
    public save(...providerKeys: string[]) {
        this.getProviders(providerKeys).forEach(({key, save}) => {
            const val = save();
            if (val !== undefined) localStorage.setItem(key, JSON.stringify(val));
        });
    }

    /**
     * restores the given providers from localStorage.
     * if no values are given, restores ALL providers.
     */
    public load(...providerKeys: string[]) {
        this.getProviders(providerKeys).forEach(({key, load, defaultValue}) => {
            try {
                const raw = localStorage.getItem(key);
                if (raw === null && defaultValue !== undefined) {
                    load(defaultValue);
                } else if (raw !== null) {
                    load(JSON.parse(raw));
                } else {
                    load(defaultValue ?? null);
                }
            } catch {
                load(defaultValue ?? null);
            }
        });
    }

    /**
     * return all providers which match the given key set.
     */
    private getProviders(keys: string[]) {
        keys.forEach(key => {
            if (!this.providers.has(key)) {
                console.warn(`no provider found with key "${key}"`);
            }
        });
        const all = [...this.providers.values()];
        return keys.length === 0 ? all : all.filter(p => keys.includes(p.key));
    }
}
