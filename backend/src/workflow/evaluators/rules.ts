export function validateRule(
    rule: string,
    context: Record<string, any>): { valid: boolean; error?: string } {
    const allowedOps = ["==", "!=", ">", "<", ">=", "<=", "&&", "||"];

    let balance = 0;
    for (const char of rule) {
        if (char === "(") balance++;
        if (char === ")") balance--;
        if (balance < 0) return { valid: false, error: "Unbalanced parentheses" };
    }
    if (balance !== 0) return { valid: false, error: "Unbalanced parentheses" };

    if (!allowedOps.some(op => rule.includes(op))) {
        return { valid: false, error: "No valid operator found" };
    }

    const fieldMatches = rule.match(/\b([a-zA-Z_][a-zA-Z0-9_.]*)\b/g) || [];
    for (const match of fieldMatches) {
        const parts = match.split(".");
        let value: any = context;
        for (const p of parts) {
            if (value && typeof value === "object" && p in value) {
                value = value[p];
            } else {
                return { valid: false, error: `Unknown field: ${match}` };
            }
        }
    }

    return { valid: true };
}

export async function evaluateRule(rule: string, instance: any): Promise<boolean> {
    const context = { application: instance.manualPayload };

    try {
        const replaced = rule.replace(/\b([a-zA-Z_][a-zA-Z0-9_.]*)\b/g, (match) => {
            const parts = match.split(".");
            let value: any = context;
            for (const p of parts) {
                if (value && typeof value === "object" && p in value) {
                    value = value[p];
                } else {
                    return match;
                }
            }
            return JSON.stringify(value);
        });

        // eslint-disable-next-line no-new-func
        return new Function(`return (${replaced});`)();
    } catch (err) {
        console.error("Rule evaluation error:", err);
        return false;
    }
}