export function normalizeConfig<T = Record<string, any>>(config: any): T {
    if (!config) return {} as T;
    if (typeof config === "string") {
        try {
            return JSON.parse(config) as T;
        } catch {
            throw new Error("Invalid JSON config");
        }
    }
    return config as T;
}