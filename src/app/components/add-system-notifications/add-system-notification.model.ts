export const STEP = {
    SEND_EMAIL: 'email',
    TRIGGER: 'trigger'
}

export interface STEPDATA {
    type: string,
    rawData?: any,
    header_text: string,
    id?: string,
    data?: any
}