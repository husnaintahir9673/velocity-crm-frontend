export const STEP = {
    SEND_EMAIL: 'email',
    TIME_DELAY: 'time-delay',
    SET_PROPERTY_VALUE: 'set-property-value',
    TRIGGER: 'trigger'
}

export interface STEPDATA {
    type: string,
    rawData?: any,
    header_text: string,
    id?: string,
    data?: any
}