export const STEP = {
    SET_PROPERTY_VALUE: 'set-property-value',
}

export interface STEPDATA {
    type: string,
    rawData?: any,
    header_text: string,
    id?: string,
    data?: any
}