type ValidateUrlResult =
    | {
          valid: true;
          url: string;
      }
    | { valid: false };

export function validateUrl(urlString: string): ValidateUrlResult {
    let urlObj;

    try {
        urlObj = new URL(urlString);
    } catch (e) {
        return { valid: false };
    }

    if (urlObj.protocol !== "https:" && urlObj.protocol !== "http:") {
        return { valid: false };
    }

    return {
        valid: true,
        url: urlObj.toString(),
    };
}
