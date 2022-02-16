// FIXME Should be more elaborate. For the moment just consider Safari doesn't support 3PC
import {IBrowser} from "ua-parser-js";

export const isBrowserKnownToSupport3PC = (browser: IBrowser) => {
    return browser?.name && !browser.name.includes('Safari')
}
