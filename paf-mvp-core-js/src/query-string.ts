export enum QSParam {
    paf = "paf"
}

export const encodeBase64 = (data: string): string => {
    return Buffer.from(data).toString('base64');
}
export const decodeBase64 = (data: string): string => {
    return Buffer.from(data, 'base64').toString('ascii');
}

export const fromDataToObject = <T>(rawData: string | undefined): T | undefined => {
    return rawData ? JSON.parse(decodeBase64(rawData)) as T : undefined
}
